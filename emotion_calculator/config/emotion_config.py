"""Configuration for emotion triggers and relationships."""

EMOTIONS = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Disgust", "Surprise", "Trust", "Anticipation"
]

EMOTION_TRIGGERS = {
    "Joy": {"sentiment": 0.7, "keywords": ["happy", "good", "great", "excellent"]},
    "Sadness": {"sentiment": -0.7, "keywords": ["sad", "unhappy", "depressed", "sorry"]},
    "Anger": {"sentiment": -0.8, "keywords": ["angry", "mad", "furious", "hate"]},
    "Fear": {"sentiment": -0.6, "keywords": ["scared", "afraid", "terrified", "kill"]},
    "Disgust": {"sentiment": -0.5, "keywords": ["disgusting", "gross", "revolting"]},
    "Surprise": {"sentiment": 0.0, "keywords": ["wow", "unexpected", "sudden"]},
    "Trust": {"sentiment": 0.5, "keywords": ["believe", "trust", "honest"]},
    "Anticipation": {"sentiment": 0.3, "keywords": ["expect", "looking forward", "soon"]}
}

RELATIONSHIP_VALUES = {
    "friend": 1.0,     # Positive relationship
    "family": 1.0,     # Positive relationship
    "colleague": 0.5,  # Somewhat positive
    "stranger": 0.0,   # Neutral
    "adversary": -0.5, # Somewhat negative
    "enemy": -1.0,     # Negative relationship
} 