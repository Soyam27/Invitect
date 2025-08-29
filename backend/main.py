from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from concurrent.futures import ThreadPoolExecutor

from utils.recommendation import get_recommended_videos
from utils.youtube import extract_video_id, get_comments, get_video_details
from utils.spam import detect_spam
from utils.sentiment import analyze_comments_batch
from utils.gemini import summarize_with_gemini

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    url: str
    summary_type: str = "brief"

@app.post("/analyze")
async def analyze(request: Request):
    body = await request.json()
    video_url = body.get("url")
    video_id = extract_video_id(video_url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}

    comments = get_comments(video_id)

    # Define blocking tasks
    def sentiment_task():
        return analyze_comments_batch(comments)

    def summary_task():
        return summarize_with_gemini(comments)

    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        results, summary_result = await asyncio.gather(
            loop.run_in_executor(executor, sentiment_task),
            loop.run_in_executor(executor, summary_task)
        )

    total = max(results["total"], 1)
    analysis_result = {
        "summary": (
            "Most viewers enjoyed the content."
            if results["positive"] > results["negative"]
            else "Mixed reactions from viewers."
        ),
        "positive": round(results["positive"] / total * 100),
        "neutral": round(results["neutral"] / total * 100),
        "negative": round(results["negative"] / total * 100),
    }

    return {"analysis": analysis_result, "summary": summary_result}


@app.post("/spamdetection")
async def spam_detection(data: dict):
    url = data.get("url")
    if not url:
        return {"error": "Missing YouTube URL"}
    vid = extract_video_id(url)
    if not vid:
        return {"error": "Invalid YouTube URL"}

    video_info = get_video_details(vid)
    comments = get_comments(vid)
    spam_results = detect_spam(comments)
    spam_count = spam_results["spam"]
    notspam_count = spam_results["total"] - spam_count

    return {
        "title": video_info["title"],
        "thumbnail": video_info["thumbnail"],
        "spam_comments": spam_count,
        "not_spam_comments": notspam_count,
        "examples": spam_results["examples"]
    }

@app.post("/compare")
async def compare_videos(request: Request):
    try:
        data = await request.json()
        url1, url2 = data.get("url1"), data.get("url2")
        if not url1 or not url2:
            return {"error": "Missing YouTube URLs"}

        # Extract IDs
        vid1, vid2 = extract_video_id(url1), extract_video_id(url2)

        # Fetch comments
        comments1, comments2 = get_comments(vid1), get_comments(vid2)

        # Analysis wrapper
        def analyze(video_id, comments):
            results = analyze_comments_batch(comments)
            total = max(results["total"], 1)
            details = get_video_details(video_id)
            return {
                "title": details["title"],
                "thumbnail": details["thumbnail"],
                "positive": round(results["positive"] / total * 100),
                "neutral": round(results["neutral"] / total * 100),
                "negative": round(results["negative"] / total * 100),
            }

        # Run analysis in threads (non-blocking)
        result1, result2 = await asyncio.gather(
            asyncio.to_thread(analyze, vid1, comments1),
            asyncio.to_thread(analyze, vid2, comments2)
        )

        # Recommendation
        recommendation = (
            "🎯 Prefer Video 1" if result1["positive"] > result2["positive"]
            else "🎯 Prefer Video 2" if result2["positive"] > result1["positive"]
            else "🤝 Both videos have similar sentiment"
        )

        return {"video1": result1, "video2": result2, "recommendation": recommendation}
    except Exception as e:
        return {"error": str(e)}

@app.post("/summarize")
def summarize(req: VideoRequest):
    # Extract YouTube video ID
    video_id = extract_video_id(req.url)

    # Fetch comments
    comments = get_comments(video_id)

    # Generate summary
    summary_text = summarize_with_gemini(comments, req.summary_type)

    # Fetch video details
    video_info = get_video_details(video_id)

    # Return modern card data
    return {
        "title": video_info["title"],          # Video title
        "thumbnail": video_info["thumbnail"],  # Video thumbnail URL
        "summary": summary_text                
         # Summarized comments
    }

class RecommendRequest(BaseModel):
    url: str
    max_results: int = 6

@app.post("/recommend")
async def recommend_videos(req: RecommendRequest):
    video_url = req.url
    max_results = req.max_results
    try:
        videos = get_recommended_videos(video_url, max_results)
        # If your function returns a list directly, wrap it in a dict
        if isinstance(videos, list):
            return {"recommended": videos}
        return videos
    except Exception as e:
        return {"error": str(e)}
