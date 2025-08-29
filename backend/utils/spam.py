import re
from transformers import pipeline

spam_classifier = pipeline(
    "text-classification",
    model="AntiSpamInstitute/spam-detector-bert-MoE-v2.2"
)

def is_spam_rule_based(comment: str) -> bool:
    spam_keywords = ["subscribe", "click", "buy now", "free", "giveaway", "check link", "visit", "offer"]
    if len(re.findall(r"http[s]?://", comment)) > 0:
        return True
    if any(word in comment.lower() for word in spam_keywords):
        return True
    if comment.isupper() and len(comment) > 15:
        return True
    if len(set(comment.split())) <= 2 and len(comment.split()) > 5:
        return True
    return False

def detect_spam(comments: list[str]):
    spam_count = 0
    spam_examples = []
    if not comments:
        return {"spam": 0, "total": 0, "examples": []}

    predictions = spam_classifier(comments, truncation=True)
    for comment, pred in zip(comments, predictions):
        label = pred["label"].lower()
        score = pred["score"]
        if is_spam_rule_based(comment) or (label == "spam" and score > 0.7):
            spam_count += 1
            if len(spam_examples) < 5:
                spam_examples.append(comment)
    return {"spam": spam_count, "total": len(comments), "examples": spam_examples}
