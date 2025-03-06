"""Semantic analysis module for text processing."""

import spacy
from textblob import TextBlob
from typing import Dict, List, Any

from emotion_calculator.data.models import SemanticAnalysisResult


class SemanticAnalyzer:
    """Analyzes text to extract semantic features and sentiment."""
    
    def __init__(self):
        """Initialize the semantic analyzer with NLP models."""
        self.nlp = spacy.load("en_core_web_sm")
    
    def analyze(self, text: str) -> SemanticAnalysisResult:
        """
        Analyze text to extract semantic features and sentiment.
        
        Args:
            text: Input text to analyze
            
        Returns:
            A SemanticAnalysisResult containing analysis results
        """
        doc = self.nlp(text)
        blob = TextBlob(text)
        
        # Extract sentiment using TextBlob
        sentiment = blob.sentiment.polarity  # Range: -1 (negative) to 1 (positive)
        subjectivity = blob.sentiment.subjectivity  # Range: 0 (objective) to 1 (subjective)
        
        # Extract key entities
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        
        # Extract key verbs (actions)
        actions = [token.lemma_ for token in doc if token.pos_ == "VERB"]
        
        # Extract keywords (nouns and proper nouns)
        keywords = [token.lemma_ for token in doc if token.pos_ in ["NOUN", "PROPN"]]
        
        return SemanticAnalysisResult(
            sentiment=sentiment,
            subjectivity=subjectivity,
            entities=entities,
            actions=actions,
            keywords=keywords,
            full_text=text
        ) 