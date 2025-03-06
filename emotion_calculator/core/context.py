"""Context judgment module for determining relationship context."""

from typing import Dict, List, Optional, Any

from emotion_calculator.config.emotion_config import RELATIONSHIP_VALUES
from emotion_calculator.data.models import ContextResult


class ContextJudge:
    """Determines the context of a conversation based on relationships and history."""
    
    def __init__(self):
        """Initialize the context judge with known relationships."""
        self.known_relationships = RELATIONSHIP_VALUES
    
    def determine_context(
        self, 
        relationship: Optional[str] = None, 
        history: Optional[List] = None, 
        additional_context: Optional[Dict] = None
    ) -> ContextResult:
        """
        Determine the context of the conversation based on relationship and history.
        
        Args:
            relationship: The known relationship between user and machine
            history: Previous interactions
            additional_context: Any additional context information
            
        Returns:
            A ContextResult containing context information
        """
        context_result = ContextResult()
        
        # Determine relationship context
        if relationship and relationship.lower() in self.known_relationships:
            context_result.relationship_type = relationship.lower()
            context_result.relationship_value = self.known_relationships[relationship.lower()]
            
            # Adjust trust based on relationship
            if context_result.relationship_value > 0:
                context_result.trust_level = 0.5 + (context_result.relationship_value * 0.5)
            else:
                context_result.trust_level = 0.5 + (context_result.relationship_value * 0.5)
        
        # Process additional context if provided
        if additional_context:
            if "formal_setting" in additional_context:
                context_result.formality_level = 0.8  # High formality
                
            if "previous_trust_breach" in additional_context:
                context_result.trust_level *= 0.5  # Reduce trust
        
        return context_result 