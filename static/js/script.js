// EmotionAI JavaScript - Chat Interface

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatHistory = document.getElementById('chat-history');
    const textInput = document.getElementById('text-input');
    const relationshipSelect = document.getElementById('relationship');
    const analyzeBtn = document.getElementById('analyze-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    
    // Templates
    const userMessageTemplate = document.getElementById('user-message-template');
    const aiResponseTemplate = document.getElementById('ai-response-template');
    
    // Chart instances - store in a map to handle multiple charts
    const chartInstances = new Map();
    
    // Emotion colors
    const emotionColors = {
        'Joy': '#f59e0b',
        'Sadness': '#3b82f6',
        'Anger': '#ef4444', 
        'Fear': '#8b5cf6',
        'Disgust': '#10b981',
        'Surprise': '#f97316',
        'Trust': '#06b6d4',
        'Anticipation': '#fbbf24'
    };
    
    // Auto resize the textarea as the user types
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Initialize a new emotion chart
    function initChart(canvasElement, chartId) {
        const ctx = canvasElement.getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Emotion Intensity (%)',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Intensity (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Emotions'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
        
        // Store the chart instance in the map
        chartInstances.set(chartId, chart);
        
        return chart;
    }
    
    // Update an existing chart with new data
    function updateChart(chartId, emotions) {
        const chart = chartInstances.get(chartId);
        
        if (!chart) {
            console.error('Chart not found:', chartId);
            return;
        }
        
        const labels = Object.keys(emotions);
        const data = Object.values(emotions);
        const backgroundColors = labels.map(label => emotionColors[label] || '#6c757d');
        const borderColors = backgroundColors.map(color => color);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = backgroundColors;
        chart.data.datasets[0].borderColor = borderColors;
        
        chart.update();
    }
    
    // Add a user message to the chat
    function addUserMessage(text) {
        const template = userMessageTemplate.content.cloneNode(true);
        template.querySelector('.message-text').textContent = text;
        chatHistory.appendChild(template);
        scrollToBottom();
    }
    
    // Add an AI response with emotion analysis to the chat
    function addAiResponse(response) {
        const template = aiResponseTemplate.content.cloneNode(true);
        const chartId = `chart-${Date.now()}`;
        const chartCanvas = template.querySelector('.emotions-chart');
        chartCanvas.id = chartId;
        
        // Set the dominant emotion
        const dominantEmotion = template.querySelector('.dominant-emotion');
        dominantEmotion.textContent = response.dominant_emotion;
        dominantEmotion.style.color = emotionColors[response.dominant_emotion] || '#333';
        
        // Set the context information
        template.querySelector('.relationship-type').textContent = response.context.relationship_type;
        template.querySelector('.trust-level').textContent = `${Math.round(response.context.trust_level * 100)}%`;
        template.querySelector('.formality-level').textContent = `${Math.round(response.context.formality_level * 100)}%`;
        
        // Add to the chat history
        chatHistory.appendChild(template);
        
        // Initialize the chart now that it's in the DOM
        initChart(document.getElementById(chartId), chartId);
        updateChart(chartId, response.emotions);
        
        scrollToBottom();
    }
    
    // Scroll chat to the bottom
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // Clear the chat history
    function clearChat() {
        // Keep only the first welcome message
        const firstMessage = chatHistory.querySelector('.chat-message');
        chatHistory.innerHTML = '';
        chatHistory.appendChild(firstMessage);
        
        // Clear the chart instances
        chartInstances.clear();
    }
    
    // Analyze emotions
    async function analyzeEmotions() {
        const text = textInput.value.trim();
        const relationship = relationshipSelect.value;
        
        if (!text) {
            return;
        }
        
        // Add user message to chat
        addUserMessage(text);
        
        // Clear input
        textInput.value = '';
        textInput.style.height = 'auto';
        
        // Show "AI is thinking..." message
        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'chat-message ai-message thinking-message';
        thinkingMessage.innerHTML = `
            <div class="message-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Analyzing emotions...</p>
            </div>
        `;
        chatHistory.appendChild(thinkingMessage);
        scrollToBottom();
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    relationship: relationship
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze emotions');
            }
            
            const result = await response.json();
            
            // Remove thinking message
            chatHistory.removeChild(thinkingMessage);
            
            // Add AI response with analysis
            addAiResponse(result);
            
        } catch (error) {
            // Remove thinking message
            chatHistory.removeChild(thinkingMessage);
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-message ai-message error-message';
            errorMessage.innerHTML = `
                <div class="message-avatar">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Sorry, there was an error analyzing emotions. Please try again.</p>
                </div>
            `;
            chatHistory.appendChild(errorMessage);
            console.error('Error:', error);
        }
    }
    
    // Event listeners
    analyzeBtn.addEventListener('click', analyzeEmotions);
    
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to avoid newline
            analyzeEmotions();
        }
    });
    
    newChatBtn.addEventListener('click', function() {
        clearChat();
    });
    
    // Focus input on page load
    textInput.focus();
}); 