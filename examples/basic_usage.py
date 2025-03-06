"""Basic usage example for the emotion calculator."""

from emotion_calculator import EmotionCalculator

# Initialize the calculator
calculator = EmotionCalculator()

# Calculate emotion for a threatening statement with different contexts
text = "I'm going to kill you"

# With enemy context
enemy_result = calculator.calculate_emotion(text, relationship="enemy")
print(f"Enemy context: {enemy_result.dominant_emotion}")
print(f"Emotion distribution: {enemy_result.emotions}")

# With friend context
friend_result = calculator.calculate_emotion(text, relationship="friend")
print(f"Friend context: {friend_result.dominant_emotion}")
print(f"Emotion distribution: {friend_result.emotions}")

# With additional context
additional_context = {"formal_setting": True, "previous_trust_breach": True}
complex_result = calculator.calculate_emotion(
    text, 
    relationship="colleague",
    additional_context=additional_context
)
print(f"Complex context: {complex_result.dominant_emotion}")
print(f"Emotion distribution: {complex_result.emotions}") 