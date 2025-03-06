"""Web interface for the Emotion Calculator."""

from flask import Flask, render_template, request, jsonify
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the current directory to sys.path to enable imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from emotion_calculator.core.analyzer import EmotionCalculator
    logger.info("Successfully imported EmotionCalculator")
except ImportError as e:
    logger.error(f"Error importing EmotionCalculator: {e}")
    raise

app = Flask(__name__, 
           static_folder='static',  
           template_folder='templates')

# Initialize the emotion calculator
calculator = EmotionCalculator()

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Process the user input and return emotion analysis."""
    try:
        data = request.json
        text = data.get('text', '')
        relationship = data.get('relationship', 'neutral')
        
        logger.info(f"Analyzing text: '{text}' with relationship: {relationship}")
        
        # Analyze the emotion
        result = calculator.calculate_emotion(text, relationship=relationship)
        
        # Prepare the response
        response = {
            'emotions': result.emotions,
            'dominant_emotion': result.dominant_emotion,
            'context': {
                'relationship_type': result.context.relationship_type,
                'trust_level': result.context.trust_level,
                'formality_level': result.context.formality_level
            }
        }
        
        logger.info(f"Analysis complete. Dominant emotion: {result.dominant_emotion}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting EmotionAI web application")
    app.run(debug=True, host='0.0.0.0', port=5000) 