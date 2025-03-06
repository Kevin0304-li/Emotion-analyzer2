# Emotion Calculator

An AI-powered emotion calculator that determines a machine's emotional response based on text input and contextual relationships.

## Overview

This project analyzes text input to determine an appropriate emotional response based on:
- Semantic analysis of the text (meaning, sentiment, entities)
- Context of the relationship between speaker and machine (friend, enemy, etc.)
- Mapping of these factors to a distribution of emotions

## Installation

### From Source

1. Clone this repository
2. Install the package:
   ```
   pip install -e .
   ```
3. Download the required spaCy model:
   ```
   python -m spacy download en_core_web_sm
   ```

## Usage

### Command Line

```bash
# Run with default demo examples
python -m emotion_calculator.cli

# Process specific text
python -m emotion_calculator.cli --text "I'm going to kill you" --relationship friend

# Run in interactive mode
python -m emotion_calculator.cli --interactive
```

### Python API

```python
from emotion_calculator import EmotionCalculator

# Initialize the calculator
calculator = EmotionCalculator()

# Calculate emotions for text with context
result = calculator.calculate_emotion(
    "I'm going to kill you", 
    relationship="friend"
)

# View the results
print(f"Dominant emotion: {result.dominant_emotion}")
print(f"All emotions: {result.emotions}")
```

## Project Structure

- `emotion_calculator/` - Main package
  - `config/` - Configuration for emotions and relationships
  - `core/` - Core processing modules
  - `data/` - Data models and structures
  - `utils/` - Utility functions
  - `cli.py` - Command-line interface
- `tests/` - Unit tests
- `examples/` - Example usage scripts

## Extending the Project

To extend this project, you could:
- Add more sophisticated NLP techniques
- Create a database of past interactions to refine context judgment
- Implement machine learning to improve emotion mapping
- Add a web API layer for remote access 