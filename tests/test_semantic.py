"""Tests for the semantic analysis module."""

import unittest
from emotion_calculator.core.semantic import SemanticAnalyzer


class TestSemanticAnalysis(unittest.TestCase):
    """Test cases for the semantic analyzer."""
    
    def setUp(self):
        """Set up the semantic analyzer for testing."""
        self.analyzer = SemanticAnalyzer()
    
    def test_positive_sentiment(self):
        """Test that positive text gets positive sentiment."""
        result = self.analyzer.analyze("I am very happy today!")
        self.assertGreater(result.sentiment, 0)
    
    def test_negative_sentiment(self):
        """Test that negative text gets negative sentiment."""
        result = self.analyzer.analyze("I am very angry and upset.")
        self.assertLess(result.sentiment, 0)
    
    def test_action_extraction(self):
        """Test that actions (verbs) are correctly extracted."""
        result = self.analyzer.analyze("I will kill you tomorrow.")
        self.assertIn("kill", result.actions)


if __name__ == "__main__":
    unittest.main() 