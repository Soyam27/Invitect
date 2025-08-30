from fastapi import FastAPI, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

from utils.firebaseutils import saveHit, fetchHits
from utils.recommendation import get_recommended_videos
from utils.youtube import extract_video_id, get_comments, get_video_details
from utils.spam import detect_spam
from utils.sentiment import analyze_comments_batch
from utils.gemini import summarize_with_gemini

import firebase_admin
from firebase_admin import auth

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(level=logging.INFO)

# -----------------------------
# App & CORS
# -----------------------------
app = FastAPI()
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class VideoRequest(BaseModel):
    url: str
    summary_type: str = "brief"

class RecommendRequest(BaseModel):
    url: str
    max_results: int = 6

# -----------------------------
# Firebase token helpers
# -----------------------------
async def get_user_from_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        logging.warning(f"Token verification failed: {e}")
        return None

async def get_user_id(authorization: str):
    token = (authorization or "").replace("Bearer ", "")
    return await get_user_from_token(token)

# -----------------------------
# Generalized hit builder
# -----------------------------
def build_hit_data(actionType: str, video_info=None, **extra):
    hit = {"actionType": actionType}
    if video_info:
        hit["videoUrl"] = video_info.get("url") or ""
        hit["videoTitle"] = video_info.get("title") or "Unknown title"
        hit["thumbnail"] = video_info.get("thumbnail") or ""
    hit.update(extra)
    return hit

async def save_hit_safe(hit_data: dict, user_id: str):
    if not user_id:
        logging.warning(f"Cannot save hit: user_id is None, data: {hit_data}")
        return
    try:
        await asyncio.to_thread(saveHit, hit_data, user_id)
        logging.info(f"Saved hit for user {user_id}: {hit_data}")
    except Exception as e:
        logging.error(f"Failed to save hit: {e}")

# -----------------------------
# Analyze Endpoint
# -----------------------------
@app.post("/analyze")
async def analyze(request: Request, authorization: str = Header(None)):
    body = await request.json()
    video_url = body.get("url")
    if not video_url:
        return {"error": "Missing YouTube URL"}

    user_id = await get_user_id(authorization)
    video_id = extract_video_id(video_url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}

    comments = get_comments(video_id)
    video_info = get_video_details(video_id) or {}
    video_info.setdefault("url", video_url)
    video_info.setdefault("title", "Unknown title")
    video_info.setdefault("thumbnail", "")

    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        results, summary_result = await asyncio.gather(
            loop.run_in_executor(executor, lambda: analyze_comments_batch(comments)),
            loop.run_in_executor(executor, lambda: summarize_with_gemini(comments))
        )

    total = max(results.get("total", 1), 1)
    analysis_result = {
        "summary": "Most viewers enjoyed the content." if results.get("positive", 0) > results.get("negative", 0) else "Mixed reactions from viewers.",
        "positive": round(results.get("positive", 0) / total * 100),
        "neutral": round(results.get("neutral", 0) / total * 100),
        "negative": round(results.get("negative", 0) / total * 100),
    }

    hit_data = build_hit_data(
        actionType="Analysis",
        video_info=video_info,
        analysis=analysis_result,
        summary=summary_result
    )
    await save_hit_safe(hit_data, user_id)

    return {"analysis": analysis_result, "summary": summary_result, "videoInfo": video_info}

# -----------------------------
# Compare Endpoint
# -----------------------------
@app.post("/compare")
async def compare_videos(request: Request, authorization: str = Header(None)):
    data = await request.json()
    url1, url2 = data.get("url1"), data.get("url2")
    if not url1 or not url2:
        return {"error": "Missing YouTube URLs"}

    user_id = await get_user_id(authorization)
    vid1, vid2 = extract_video_id(url1), extract_video_id(url2)
    comments1, comments2 = get_comments(vid1), get_comments(vid2)

    def analyze(video_id, comments):
        results = analyze_comments_batch(comments)
        total = max(results.get("total", 1), 1)
        details = get_video_details(video_id) or {}
        details.setdefault("title", "Unknown title")
        details.setdefault("thumbnail", "")
        return {
            "title": details.get("title"),
            "thumbnail": details.get("thumbnail"),
            "positive": round(results.get("positive", 0) / total * 100),
            "neutral": round(results.get("neutral", 0) / total * 100),
            "negative": round(results.get("negative", 0) / total * 100),
        }

    result1, result2 = await asyncio.gather(
        asyncio.to_thread(analyze, vid1, comments1),
        asyncio.to_thread(analyze, vid2, comments2)
    )

    recommendation = (
        "🎯 Prefer Video 1" if result1["positive"] > result2["positive"]
        else "🎯 Prefer Video 2" if result2["positive"] > result1["positive"]
        else "🤝 Both videos have similar sentiment"
    )

    hit_data = build_hit_data(
        actionType="Compare",
        video_info={"url1": url1, "url2": url2},
        video1=result1,
        video2=result2,
        recommendation=recommendation
    )
    await save_hit_safe(hit_data, user_id)

    return {"video1": result1, "video2": result2, "recommendation": recommendation}

# -----------------------------
# Summarize Endpoint
# -----------------------------
@app.post("/summarize")
async def summarize(req: VideoRequest, authorization: str = Header(None)):
    video_id = extract_video_id(req.url)
    comments = get_comments(video_id)
    summary_text = summarize_with_gemini(comments, req.summary_type)
    video_info = get_video_details(video_id) or {}
    video_info.setdefault("url", req.url)
    video_info.setdefault("title", "Unknown title")
    video_info.setdefault("thumbnail", "")

    user_id = await get_user_id(authorization)

    hit_data = build_hit_data(
        actionType="Summarize",
        video_info=video_info,
        summary=summary_text
    )
    await save_hit_safe(hit_data, user_id)

    return {"title": video_info.get("title"), "thumbnail": video_info.get("thumbnail"), "summary": summary_text}

# -----------------------------
# Recommend Endpoint
# -----------------------------
@app.post("/recommend")
async def recommend_videos(req: RecommendRequest, authorization: str = Header(None)):
    user_id = await get_user_id(authorization)

    try:
        videos = get_recommended_videos(req.url, req.max_results)
    except Exception as e:
        return {"error": str(e)}

    hit_data = build_hit_data(
        actionType="Recommend",
        video_info={"url": req.url},
        recommended=videos if isinstance(videos, list) else [videos]
    )
    await save_hit_safe(hit_data, user_id)

    return {"recommended": videos if isinstance(videos, list) else [videos]}

# -----------------------------
# Spam Detection Endpoint
# -----------------------------
@app.post("/spamdetection")
async def spam_detection(request: Request, authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    if not user_id:
        return {"error": "Unauthorized"}

    data = await request.json()
    url = data.get("url")
    if not url:
        return {"error": "Missing YouTube URL"}

    vid = extract_video_id(url)
    if not vid:
        return {"error": "Invalid YouTube URL"}

    video_info = get_video_details(vid) or {}
    video_info.setdefault("url", url)
    video_info.setdefault("title", "Unknown title")
    video_info.setdefault("thumbnail", "")

    comments = get_comments(vid)
    spam_results = detect_spam(comments)

    hit_data = build_hit_data(
        actionType="SpamDetection",
        video_info=video_info,
        spam_results=spam_results
    )
    await save_hit_safe(hit_data, user_id)
    return {
        "title": video_info.get("title"),
        "thumbnail": video_info.get("thumbnail"),
        "spam_comments": spam_results['spam'],
        "not_spam_comments": spam_results['total'] - spam_results['spam'],
        "examples": spam_results.get("examples", [])
    }

# -----------------------------
# Dashboard Endpoint
# -----------------------------
@app.get("/dashboard")
async def dashboard(authorization: str = Header(None)):
    user_id = await get_user_id(authorization)
    if not user_id:
        return {"error": "Unauthorized"}

    hits = await asyncio.to_thread(fetchHits, user_id)
    hits_sorted = sorted(hits, key=lambda h: h.get("timestamp", 0), reverse=True)
    return {"hits": hits_sorted}
