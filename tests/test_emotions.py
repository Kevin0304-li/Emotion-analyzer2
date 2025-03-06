"""Tests for the emotion mapping module."""

import unittest
from emotion_calculator.core.emotions import EmotionMapper
from emotion_calculator.data.models import SemanticAnalysisResult, ContextResult


class TestEmotionMapping(unittest.TestCase):
    """Test cases for the emotion mapper."""
    
    def setUp(self):
        """Set up the emotion mapper for testing."""
        self.mapper = EmotionMapper()
    
    def test_fear_with_threat(self):
        """Test that threats with negative relationships produce fear."""
        semantic_data = SemanticAnalysisResult(
            sentiment=-0.8,
            subjectivity=0.5,
            entities=[],
            actions=["kill"],
            keywords=[],
            full_text="I will kill you"
        )
        
        context_data = ContextResult(
            relationship_type="enemy",
            relationship_value=-1.0
        )
        
        result = self.mapper.map_emotions(semantic_data, context_data)
        self.assertGreater(result.values["Fear"], 0.3)
    
    def test_joy_with_positive_text(self):
        """Test that positive text with friend relationships produce joy."""
        semantic_data = SemanticAnalysisResult(
            sentiment=0.8,
            subjectivity=0.5,
            entities=[],
            actions=["love"],
            keywords=[],
            full_text="I am happy to see you"
        )
        
        context_data = ContextResult(
            relationship_type="friend",
            relationship_value=1.0
        )
        
        result = self.mapper.map_emotions(semantic_data, context_data)
        self.assertGreater(result.values["Joy"], 0.3)


if __name__ == "__main__":
    unittest.main() 