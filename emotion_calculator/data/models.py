"""Data models for the emotion calculator."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class SemanticAnalysisResult:
    """Results from semantic analysis of text."""
    sentiment: float
    subjectivity: float
    entities: List[Dict[str, str]]
    actions: List[str]
    keywords: List[str]
    full_text: str


@dataclass
class ContextResult:
    """Results from context judgment."""
    relationship_type: str = "neutral"
    relationship_value: float = 0.0
    trust_level: float = 0.5
    formality_level: float = 0.5


@dataclass
class EmotionDistribution:
    """Distribution of emotions with intensity values."""
    values: Dict[str, float]

    def get_dominant_emotion(self) -> str:
        """Get the emotion with the highest intensity."""
        return max(self.values, key=self.values.get)

    def as_percentages(self) -> Dict[str, int]:
        """Convert emotion values to percentages."""
        return {emotion: round(score * 100) for emotion, score in self.values.items()}


@dataclass
class EmotionResult:
    """Final emotion calculation result."""
    input_text: str
    context: ContextResult
    emotions: Dict[str, int] = field(default_factory=dict)
    dominant_emotion: str = "" 