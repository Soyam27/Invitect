from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.nn import Softmax
import torch

MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
softmax = Softmax(dim=1)

def analyze_comments_batch(comments: list[str]):
    if not comments:
        return {"positive": 0, "neutral": 0, "negative": 0}
    try:
        encoded = tokenizer(comments, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**encoded)
            scores = softmax(outputs.logits)
            predictions = torch.argmax(scores, dim=1).tolist()

        positive = predictions.count(2)
        neutral = predictions.count(1)
        negative = predictions.count(0)

        return {"positive": positive, "neutral": neutral, "negative": negative, "total": len(comments)}
    except:
        return {"positive": 0, "neutral": len(comments), "negative": 0, "total": len(comments)}
