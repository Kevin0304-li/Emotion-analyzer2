"""Text processing utilities for the emotion calculator."""

import re
from typing import List


def clean_text(text: str) -> str:
    """
    Clean text by removing extra whitespace and normalizing.
    
    Args:
        text: The input text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Convert to lowercase
    text = text.lower()
    
    return text


def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """
    Extract potential keywords from text.
    
    Args:
        text: The input text to process
        min_length: Minimum length of words to consider
        
    Returns:
        List of potential keywords
    """
    # Split text into words
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Filter out short words and common stopwords
    stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'from'}
    
    keywords = [word for word in words if len(word) >= min_length and word not in stopwords]
    
    return keywords 