"""Main emotion calculator module integrating all components."""

from typing import Dict, Optional, Any

from emotion_calculator.core.semantic import SemanticAnalyzer
from emotion_calculator.core.context import ContextJudge
from emotion_calculator.core.emotions import EmotionMapper
from emotion_calculator.data.models import EmotionResult


class EmotionCalculator:
    """Calculates emotional responses to text based on context."""
    
    def __init__(self):
        """Initialize the emotion calculator with its component modules."""
        self.semantic_analyzer = SemanticAnalyzer()
        self.context_judge = ContextJudge()
        self.emotion_mapper = EmotionMapper()
    
    def calculate_emotion(
        self, 
        text: str, 
        relationship: Optional[str] = None, 
        additional_context: Optional[Dict] = None
    ) -> EmotionResult:
        """
        Calculate emotional response to text input with given context.
        
        Args:
            text: The input text to respond to
            relationship: Relationship to the speaker
            additional_context: Additional context information
            
        Returns:
            An EmotionResult containing the emotional response
        """
        # Step 1: Semantic analysis
        semantic_results = self.semantic_analyzer.analyze(text)
        
        # Step 2: Context judgment
        context_results = self.context_judge.determine_context(
            relationship=relationship,
            additional_context=additional_context
        )
        
        # Step 3: Emotion mapping
        emotion_distribution = self.emotion_mapper.map_emotions(
            semantic_results, 
            context_results
        )
        
        # Step 4: Format results
        dominant_emotion = emotion_distribution.get_dominant_emotion()
        emotions_as_percentages = emotion_distribution.as_percentages()
        
        return EmotionResult(
            input_text=text,
            context=context_results,
            emotions=emotions_as_percentages,
            dominant_emotion=dominant_emotion
        ) 