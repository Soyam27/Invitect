from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

load_dotenv()

# Replace with your actual API key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL."""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    return url

def get_video_details(video_id: str):
    """Fetch video title + thumbnail from YouTube API."""
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={YOUTUBE_API_KEY}"
    import requests
    res = requests.get(url).json()
    if "items" in res and res["items"]:
        snippet = res["items"][0]["snippet"]
        return {"title": snippet["title"], "thumbnail": snippet["thumbnails"]["medium"]["url"]}
    return {"title": "Unknown", "thumbnail": ""}

def get_recommended_videos(video_url: str, max_results: int = 6):
    """Fetch recommended videos based on title keywords."""
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    video_id = extract_video_id(video_url)

    try:
        # Step 1: Get video details
        resp = youtube.videos().list(part="snippet", id=video_id).execute()
        items = resp.get("items", [])
        if not items:
            return {"error": "Video not found or unavailable"}

        title = items[0]["snippet"]["title"]

        # Step 2: Search by title keywords
        search_resp = youtube.search().list(
            part="snippet",
            q=title,
            type="video",
            maxResults=max_results
        ).execute()

        results = []
        for item in search_resp.get("items", []):
            if "videoId" in item["id"]:
                results.append({
                    "videoId": item["id"]["videoId"],
                    "title": item["snippet"]["title"],
                    "description": item["snippet"]["description"],
                    "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                })

        return results if results else {"error": "No related videos found"}

    except HttpError as e:
        return {"error": f"YouTube API error: {e}"}
