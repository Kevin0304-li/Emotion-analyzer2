"""Interactive demo for the emotion calculator."""

import json
from emotion_calculator import EmotionCalculator

def main():
    # Initialize the emotion calculator
    calculator = EmotionCalculator()
    
    print("Emotion Calculator Interactive Demo")
    print("===================================")
    print("Enter text and relationship to see emotional responses.")
    print("Type 'exit' to quit the program.")
    
    while True:
        print("\n" + "-" * 50)
        user_input = input("Enter text (or 'exit'): ")
        if user_input.lower() == 'exit':
            break
            
        relationship = input("Relationship (friend/enemy/neutral/etc.): ")
        
        # Optional additional context
        use_additional = input("Add additional context? (y/n): ").lower() == 'y'
        additional_context = {}
        
        if use_additional:
            formal = input("Formal setting? (y/n): ").lower() == 'y'
            trust_breach = input("Previous trust breach? (y/n): ").lower() == 'y'
            
            if formal:
                additional_context["formal_setting"] = True
            if trust_breach:
                additional_context["previous_trust_breach"] = True
        
        # Calculate emotion
        result = calculator.calculate_emotion(
            user_input, 
            relationship=relationship,
            additional_context=additional_context if additional_context else None
        )
        
        # Display results
        print("\nEMOTIONAL RESPONSE:")
        print("-" * 20)
        print(f"Input: '{result.input_text}'")
        print(f"Context: {result.context.relationship_type} (value: {result.context.relationship_value})")
        print(f"Trust level: {result.context.trust_level:.2f}")
        print("\nEmotion Distribution:")
        
        # Sort emotions by intensity for better display
        sorted_emotions = sorted(
            result.emotions.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        for emotion, value in sorted_emotions:
            print(f"  {emotion}: {value}%")
            
        print(f"\nDominant Emotion: {result.dominant_emotion}")

if __name__ == "__main__":
    main() 