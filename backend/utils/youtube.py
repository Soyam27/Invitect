from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import requests
import os
from dotenv import load_dotenv

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def extract_video_id(url: str):
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    return url

def get_comments(video_id: str, max_comments: int = 100):
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    comments = []
    next_page_token = None

    while len(comments) < max_comments:
        try:
            response = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=100,
                textFormat="plainText",
                pageToken=next_page_token
            ).execute()
        except HttpError as e:
            if e.resp.status == 403 and "commentsDisabled" in str(e.content):
                break
            raise e

        for item in response.get("items", []):
            comments.append(item["snippet"]["topLevelComment"]["snippet"]["textDisplay"])
            if len(comments) >= max_comments:
                break
        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break
    return comments

def get_video_details(video_id: str):
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={YOUTUBE_API_KEY}"
    res = requests.get(url).json()
    if "items" in res and res["items"]:
        snippet = res["items"][0]["snippet"]
        return {"title": snippet["title"], "thumbnail": snippet["thumbnails"]["medium"]["url"]}
    return {"title": "Unknown", "thumbnail": ""}
