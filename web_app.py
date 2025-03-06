"""Web interface for the YouthMind Emotion Analysis."""

from flask import Flask, render_template, request, jsonify
import logging
import sys
import os
import json
from datetime import datetime

# Add modules directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.semantic_analysis import SemanticAnalyzer
from modules.emotion_mapping import EmotionMapper

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('youthmind_app')

# Initialize components
semantic_analyzer = SemanticAnalyzer()
emotion_mapper = EmotionMapper()

# AI Models used in this application
AI_MODELS = {
    'text analysis': 'Natural Language Toolkit (NLTK)',
    'semantic processing': 'Custom Semantic Analyzer',
    'emotion mapping': 'Multi-factor Emotion Mapper v2.1'
}

# Feedback data storage location
FEEDBACK_DIR = os.path.join(os.path.dirname(__file__), 'feedback_data')
os.makedirs(FEEDBACK_DIR, exist_ok=True)

# Convert sentiment value to a readable label
def get_sentiment_label(sentiment_value):
    """Convert sentiment value to a readable label."""
    if sentiment_value >= 0.6:
        return "Very Positive"
    elif sentiment_value >= 0.2:
        return "Positive"
    elif sentiment_value <= -0.6:
        return "Very Negative"
    elif sentiment_value <= -0.2:
        return "Negative"
    else:
        return "Neutral"

app = Flask(__name__, 
           static_url_path='', 
           static_folder='static')

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html', ai_models=AI_MODELS)

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze text and return emotion distribution."""
    try:
        data = request.get_json()
        
        if not data or not data.get('text'):
            return jsonify({'error': 'No text provided'}), 400
            
        text = data.get('text')
        relationship = data.get('relationship', 'stranger')
        session_id = data.get('sessionId', None)
        
        # Create context with relationship info
        context = {
            'relationship': relationship,
            'trust_level': 'High' if relationship in ['friend', 'family'] else 'Medium' if relationship == 'colleague' else 'Low',
            'formality': 'Formal' if relationship in ['colleague', 'stranger'] else 'Casual'
        }
        
        # Log the request with session ID for tracking
        logger.info(f"Analyzing text: '{text}' with relationship: {relationship}, session_id: {session_id}")
        
        # Analyze text
        semantic_results = semantic_analyzer.analyze_text(text)
        emotion_scores = emotion_mapper.map_emotions(semantic_results, context)
        
        # Get dominant emotion
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
        
        # Get sentiment value and label
        sentiment_value = semantic_results.get('sentiment', 0)
        sentiment_label = get_sentiment_label(sentiment_value)
        
        # Prepare response with consistent format for sentiment
        response = {
            'emotions': emotion_scores,
            'dominant_emotion': dominant_emotion,
            'sentiment': {
                'score': sentiment_value,
                'label': sentiment_label
            },
            'context': context,
            'ai_models': AI_MODELS,
        }
        
        # For backward compatibility
        response['sentiment_value'] = sentiment_value
        response['sentiment_label'] = sentiment_label
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in /analyze: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/feedback', methods=['POST'])
def feedback():
    """Store user feedback for model improvement."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No feedback data provided'}), 400
        
        # Add timestamp if not provided
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().isoformat()
            
        # Generate unique filename based on session ID and timestamp
        session_id = data.get('sessionId', 'unknown')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"feedback_{session_id}_{timestamp}.json"
        
        # Write feedback to file
        with open(os.path.join(FEEDBACK_DIR, filename), 'w') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Feedback received from session {session_id}: Rating {data.get('rating', 'none')}")
        
        return jsonify({'success': True, 'message': 'Feedback received, thank you!'})
        
    except Exception as e:
        app.logger.error(f"Error storing feedback: {str(e)}")
        return jsonify({'error': str(e)}), 500
        
@app.route('/feedback/report', methods=['GET'])
def feedback_report():
    """Generate a report of collected feedback (admin only)."""
    # This would typically have authentication, but we'll skip it for simplicity
    try:
        # Read all feedback files
        feedback_files = [f for f in os.listdir(FEEDBACK_DIR) if f.endswith('.json')]
        feedback_data = []
        
        for filename in feedback_files:
            try:
                with open(os.path.join(FEEDBACK_DIR, filename), 'r') as f:
                    data = json.load(f)
                    feedback_data.append(data)
            except Exception as e:
                logger.error(f"Error reading feedback file {filename}: {str(e)}")
        
        # Generate some simple stats
        total_entries = len(feedback_data)
        avg_rating = sum(entry.get('rating', 0) for entry in feedback_data) / total_entries if total_entries > 0 else 0
        
        return render_template('feedback_report.html', 
                              feedback_data=feedback_data, 
                              total_entries=total_entries,
                              avg_rating=avg_rating)
                              
    except Exception as e:
        app.logger.error(f"Error generating feedback report: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 