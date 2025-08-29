import os
from dotenv import load_dotenv
from google import genai
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

def summarize_with_gemini(comments, summary_type="short"):
    if not comments:
        return "No comments available."
    prompt_style = {
        "short": f"Summarize the following comments in 2-3 concise sentences.:{comments}",
        "brief": f"Summarize the following comments in a short paragraph highlighting key points.:{comments}",
        "broad": f"Summarize the following comments in a detailed paragraph covering all main opinions.:{comments}"
    }
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{prompt_style[summary_type]}"
        )
        return {"summary": response.text}
    except Exception as e:
        return f"Error generating summary: {str(e)}"
