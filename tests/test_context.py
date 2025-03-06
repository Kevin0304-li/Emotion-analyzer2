"""Tests for the context judgment module."""

import unittest
from emotion_calculator.core.context import ContextJudge


class TestContextJudgment(unittest.TestCase):
    """Test cases for the context judge."""
    
    def setUp(self):
        """Set up the context judge for testing."""
        self.judge = ContextJudge()
    
    def test_friend_relationship(self):
        """Test that friend relationship is correctly identified."""
        result = self.judge.determine_context(relationship="friend")
        self.assertEqual(result.relationship_type, "friend")
        self.assertEqual(result.relationship_value, 1.0)
    
    def test_enemy_relationship(self):
        """Test that enemy relationship is correctly identified."""
        result = self.judge.determine_context(relationship="enemy")
        self.assertEqual(result.relationship_type, "enemy")
        self.assertEqual(result.relationship_value, -1.0)
    
    def test_unknown_relationship(self):
        """Test that unknown relationships default to neutral."""
        result = self.judge.determine_context(relationship="unknown_type")
        self.assertEqual(result.relationship_type, "neutral")


if __name__ == "__main__":
    unittest.main() 