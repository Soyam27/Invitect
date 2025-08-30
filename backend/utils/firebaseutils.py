import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
import json
from dotenv import load_dotenv

load_dotenv()
# Initialize Firebase Admin once
service_account_info = json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT'])
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def saveHit(hit_data: dict, user_id: str):
    """Save a full user hit (synchronous)"""
    # Ensure required fields exist
    default_fields = {
        "videoUrl": "",
        "videoTitle": "",
        "thumbnail": "",
        "actionType": "",
        "analysis": None,
        "summary": None,
        "recommended": None,
        "spam_results": None
    }
    data = {**default_fields, **hit_data, "userId": user_id, "timestamp": datetime.utcnow()}

    try:
        doc_ref = db.collection("hits").document()
        doc_ref.set(data)
        print(f"[Firebase] Hit saved for user {user_id}: {data['actionType']}")
    except Exception as e:
        print(f"[Firebase] Failed to save hit for user {user_id}: {e}")

def fetchHits(user_id: str):
    """Fetch all hits for a specific user (synchronous)"""
    try:
        hits_ref = db.collection("hits")
        query = hits_ref.where("userId", "==", user_id)
        docs = query.stream()
        return [{"id": doc.id, **doc.to_dict()} for doc in docs]
    except Exception as e:
        print(f"[Firebase] Failed to fetch hits for user {user_id}: {e}")
        return []
