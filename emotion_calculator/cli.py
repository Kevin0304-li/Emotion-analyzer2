"""Command-line interface for the emotion calculator."""

import json
import argparse
from typing import Dict, Optional

from emotion_calculator.core.analyzer import EmotionCalculator


def interactive_mode(calculator: EmotionCalculator) -> None:
    """Run the emotion calculator in interactive mode."""
    print("\nInteractive Mode (type 'exit' to quit)")
    while True:
        user_input = input("\nEnter text: ")
        if user_input.lower() == 'exit':
            break
            
        relationship = input("Relationship (friend/enemy/neutral/etc.): ")
        result = calculator.calculate_emotion(user_input, relationship=relationship)
        
        print("Emotional response:")
        print(json.dumps(result.emotions, indent=2))
        print(f"Dominant emotion: {result.dominant_emotion}")


def main() -> None:
    """Main entry point for the emotion calculator CLI."""
    parser = argparse.ArgumentParser(description="Emotion Calculator")
    parser.add_argument("--text", help="Input text to analyze")
    parser.add_argument("--relationship", help="Relationship to the speaker")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    
    args = parser.parse_args()
    
    # Initialize the emotion calculator
    calculator = EmotionCalculator()
    
    # Run in interactive mode if requested
    if args.interactive:
        interactive_mode(calculator)
        return
        
    # Run with provided arguments
    if args.text:
        result = calculator.calculate_emotion(args.text, relationship=args.relationship)
        print(json.dumps(result.emotions, indent=2))
        print(f"Dominant emotion: {result.dominant_emotion}")
        return
        
    # Default to demo mode if no arguments provided
    print("Emotion Calculator Demo")
    print("======================")
    
    # Example 1: Negative statement with enemy context
    text1 = "I'm going to kill you"
    result1 = calculator.calculate_emotion(text1, relationship="enemy")
    print(f"\nInput: '{text1}' (from an enemy)")
    print("Emotional response:")
    print(json.dumps(result1.emotions, indent=2))
    print(f"Dominant emotion: {result1.dominant_emotion}")
    
    # Example 2: Same statement with friend context
    result2 = calculator.calculate_emotion(text1, relationship="friend")
    print(f"\nInput: '{text1}' (from a friend)")
    print("Emotional response:")
    print(json.dumps(result2.emotions, indent=2))
    print(f"Dominant emotion: {result2.dominant_emotion}")
    
    # Example 3: Positive statement
    text2 = "I'm so happy to see you today!"
    result3 = calculator.calculate_emotion(text2, relationship="colleague")
    print(f"\nInput: '{text2}' (from a colleague)")
    print("Emotional response:")
    print(json.dumps(result3.emotions, indent=2))
    print(f"Dominant emotion: {result3.dominant_emotion}")
    
    # Switch to interactive mode
    interactive_mode(calculator)


if __name__ == "__main__":
    main() 