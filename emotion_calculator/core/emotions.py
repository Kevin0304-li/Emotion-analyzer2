"""Emotion mapping module for determining emotional responses."""

from typing import Dict, Any

from emotion_calculator.config.emotion_config import EMOTIONS, EMOTION_TRIGGERS
from emotion_calculator.data.models import SemanticAnalysisResult, ContextResult, EmotionDistribution


class EmotionMapper:
    """Maps semantic analysis and context to a distribution of emotions."""
    
    def __init__(self):
        """Initialize the emotion mapper with emotions and triggers."""
        self.emotions = EMOTIONS
        self.emotion_triggers = EMOTION_TRIGGERS
        
    def map_emotions(
        self, 
        semantic_analysis: SemanticAnalysisResult, 
        context: ContextResult
    ) -> EmotionDistribution:
        """
        Map semantic analysis and context to a distribution of emotions.
        
        Args:
            semantic_analysis: Results from semantic analysis
            context: Context information
            
        Returns:
            An EmotionDistribution mapping emotions to intensity values (0.0 to 1.0)
        """
        # Initialize emotions with base values
        emotion_values = {emotion: 0.1 for emotion in self.emotions}
        
        # Adjust based on sentiment
        sentiment = semantic_analysis.sentiment
        
        # Adjust emotions based on sentiment
        for emotion, triggers in self.emotion_triggers.items():
            # Sentiment influence
            sentiment_target = triggers["sentiment"]
            sentiment_distance = abs(sentiment - sentiment_target)
            sentiment_factor = max(0, 1 - sentiment_distance)
            
            # Keyword influence
            keyword_factor = 0
            for keyword in triggers["keywords"]:
                if keyword in semantic_analysis.full_text.lower():
                    keyword_factor += 0.2
                    
            # Add to emotion score (with scaling)
            emotion_values[emotion] += (sentiment_factor * 0.6) + (keyword_factor * 0.4)
        
        # Context adjustments
        relationship_value = context.relationship_value
        
        # Threatening actions with negative relationship increases fear
        if "kill" in semantic_analysis.actions or "hurt" in semantic_analysis.actions:
            if relationship_value < 0:
                emotion_values["Fear"] += 0.5
            elif relationship_value > 0.5:
                # Friends might be joking
                emotion_values["Joy"] += 0.3
                
        # Normalize to ensure sum is 1.0
        total = sum(emotion_values.values())
        for emotion in emotion_values:
            emotion_values[emotion] /= total
            
        return EmotionDistribution(values=emotion_values) 