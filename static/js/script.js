// EmotionAI JavaScript - Chat Interface

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const chatHistory = document.getElementById('chat-history');
    const relationshipSelect = document.getElementById('relationship-select');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyBtn = document.getElementById('history-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackSubmit = document.getElementById('feedback-submit');
    const feedbackSkip = document.getElementById('feedback-skip');
    const ratingStars = document.querySelectorAll('.rating-star');
    
    // Variables
    let messageCount = 0;
    let sessionId = generateSessionId();
    let selectedRating = 0;
    const sessionStartTime = new Date();
    let emotionsChart = null;
    
    console.log('YouthMind app initialized with session ID:', sessionId);
    
    // Check for URL parameter to continue a previous chat
    loadChatHistory();
    
    // Auto-resize textarea
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable analyze button based on input
        analyzeBtn.disabled = this.value.trim().length === 0;
    });
    
    // Set initial state of analyze button
    analyzeBtn.disabled = true;
    
    // Throttle function to prevent too many requests
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Enter key triggers analysis
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !analyzeBtn.disabled) {
            e.preventDefault();
            analyzeEmotions();
        }
    });
    
    // Generate a unique session ID
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Save conversation history to localStorage
    function saveChatHistory() {
        console.log('Saving chat history...');
        
        // Skip saving if no messages
        const messages = document.querySelectorAll('.chat-message');
        if (messages.length <= 1) { // Skip if only welcome message
            console.log('No messages to save');
            return;
        }
        
        // Get current chat messages
        const chatMessages = [];
        let messageIndex = 0;
        
        messages.forEach((message, index) => {
            // Skip the first welcome message
            if (index === 0 && message.classList.contains('ai-message')) {
                return;
            }
            
            const isUser = message.classList.contains('user-message');
            const isAI = message.classList.contains('ai-message');
            
            if (isUser || isAI) {
                const content = message.querySelector('.message-content').innerHTML;
                const type = isUser ? 'user' : 'ai';
                chatMessages.push({ type, content, timestamp: new Date().toISOString() });
                messageIndex++;
            }
        });
        
        if (chatMessages.length === 0) {
            console.log('No valid messages to save after filtering');
            return;
        }
        
        // Get chat information
        const chatData = {
            id: sessionId,
            startTime: sessionStartTime.toISOString(),
            lastUpdated: new Date().toISOString(),
            relationship: relationshipSelect.value,
            messages: chatMessages
        };
        
        // Get existing chat history array
        let chatHistoryArray = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Find if this chat already exists in the array
        const existingIndex = chatHistoryArray.findIndex(chat => chat.id === sessionId);
        
        if (existingIndex !== -1) {
            // Update existing chat
            chatHistoryArray[existingIndex] = chatData;
            console.log('Updated existing chat in history');
        } else {
            // Add new chat
            chatHistoryArray.unshift(chatData); // Add to beginning of array
            console.log('Added new chat to history');
        }
        
        // Keep only the last 10 chats to prevent localStorage overflow
        if (chatHistoryArray.length > 10) {
            chatHistoryArray = chatHistoryArray.slice(0, 10);
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistoryArray));
            console.log('Chat history saved successfully:', chatHistoryArray.length, 'total chats');
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    // Load chat history from localStorage
    function loadChatHistory() {
        console.log('Loading chat history...');
        
        // Check if we should continue a previous chat
        const urlParams = new URLSearchParams(window.location.search);
        const continueId = urlParams.get('continue');
        
        if (!continueId) {
            console.log('No continue parameter found in URL');
            return;
        }
        
        console.log('Continue parameter found:', continueId);
        
        try {
            // Get chat history from localStorage
            const chatHistoryArray = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            console.log('Retrieved chat history, found', chatHistoryArray.length, 'chats');
            
            // Find the chat we want to continue
            const chatToLoad = chatHistoryArray.find(chat => chat.id === continueId);
            
            if (!chatToLoad) {
                console.error('Chat with ID', continueId, 'not found in history');
                return;
            }
            
            // Set session ID to the one we're continuing
            sessionId = chatToLoad.id;
            console.log('Continuing session with ID:', sessionId);
            
            // Set relationship
            if (chatToLoad.relationship && relationshipSelect) {
                relationshipSelect.value = chatToLoad.relationship;
                console.log('Set relationship to:', chatToLoad.relationship);
            }
            
            // Clear existing chat
            clearChat(false); // Don't reset session ID
            
            // Load messages
            if (chatToLoad.messages && chatToLoad.messages.length > 0) {
                console.log('Loading', chatToLoad.messages.length, 'messages');
                
                chatToLoad.messages.forEach(msg => {
                    if (msg.type === 'user') {
                        // Create user message
                        const template = document.getElementById('user-message-template');
                        const clone = document.importNode(template.content, true);
                        clone.querySelector('.message-text').innerHTML = msg.content;
                        chatHistory.appendChild(clone);
                    } else if (msg.type === 'ai') {
                        // Create AI message with full analysis
                        const aiMessage = document.createElement('div');
                        aiMessage.classList.add('chat-message', 'ai-message');
                        aiMessage.innerHTML = `
                            <div class="message-avatar">
                                <i class="fa-solid fa-robot"></i>
                            </div>
                            <div class="message-content">
                                ${msg.content}
                            </div>
                        `;
                        chatHistory.appendChild(aiMessage);
                        
                        // Initialize any charts in this message
                        const canvas = aiMessage.querySelector('.emotions-chart');
                        if (canvas) {
                            initChart(canvas, canvas.id || 'emotion-chart-' + Math.random().toString(36).substring(2, 9));
                        }
                    }
                });
                
                // Update message count
                messageCount = chatToLoad.messages.length;
                console.log('Updated message count to:', messageCount);
                
                // Scroll to bottom
                scrollToBottom();
            }
            
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    // Initialize emotion chart
    function initChart(canvasElement, chartId) {
        try {
            console.log('Initializing chart with ID:', chartId);
            
            if (!canvasElement) {
                console.error('Canvas element not found for chart ID:', chartId);
                return;
            }
            
            // Default data if none is present
            const defaultEmotions = {
                Joy: 0.1,
                Sadness: 0.1,
                Anger: 0.1,
                Fear: 0.1,
                Surprise: 0.1,
                Disgust: 0.1,
                Trust: 0.4,
                Love: 0.1
            };
            
            // Get emotions data from data attributes if available
            const emotions = {};
            for (const emotion in defaultEmotions) {
                const value = canvasElement.getAttribute(`data-${emotion.toLowerCase()}`) || defaultEmotions[emotion];
                emotions[emotion] = parseFloat(value);
            }
            
            // If chart already exists, destroy it
            if (emotionsChart) {
                emotionsChart.destroy();
            }
            
            // Create new chart
            emotionsChart = new Chart(canvasElement.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: Object.keys(emotions),
                    datasets: [{
                        label: 'Emotion Intensity',
                        data: Object.values(emotions),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 1
                        }
                    }
                }
            });
            
            console.log('Chart initialized successfully');
            return emotionsChart;
        } catch (error) {
            console.error('Error initializing chart:', error);
            return null;
        }
    }
    
    // Update chart with new data
    function updateChart(chartId, emotions) {
        const chart = charts[chartId];
        if (!chart) return;
        
        const labels = [];
        const data = [];
        const backgroundColor = [];
        const borderColor = [];
        
        const colorMapping = {
            'Joy': 'var(--joy-color)',
            'Sadness': 'var(--sadness-color)',
            'Anger': 'var(--anger-color)',
            'Fear': 'var(--fear-color)',
            'Disgust': 'var(--disgust-color)',
            'Surprise': 'var(--surprise-color)',
            'Trust': 'var(--trust-color)',
            'Anticipation': 'var(--joy-color)'
        };
        
        // Find the dominant emotion
        let maxVal = 0;
        let dominantEmotion = '';
        
        for (const [emotion, value] of Object.entries(emotions)) {
            if (value > maxVal) {
                maxVal = value;
                dominantEmotion = emotion;
            }
        }
        
        for (const [emotion, value] of Object.entries(emotions)) {
            labels.push(emotion);
            // Convert to percentage and round
            const percentage = Math.round(value * 100);
            data.push(percentage);
            
            const color = colorMapping[emotion] || '#9ca3af'; // Default color if not found
            const isDominant = emotion === dominantEmotion;
            
            // Make dominant emotion stand out
            backgroundColor.push(isDominant ? color : color + '80'); // 80 = 50% opacity
            borderColor.push(color);
        }
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = backgroundColor;
        chart.data.datasets[0].borderColor = borderColor;
        chart.update();
    }
    
    // Add user message to chat
    function addUserMessage(text) {
        const template = document.getElementById('user-message-template');
        const clone = document.importNode(template.content, true);
        
        clone.querySelector('.message-text').textContent = text;
        
        chatHistory.appendChild(clone);
        scrollToBottom();
        
        // Save the updated chat history
        saveChatHistory();
        
        // Increment message count for this session
        messageCount++;
    }
    
    // Add AI response to chat
    function addAiResponse(response) {
        console.log('Adding AI response:', response);
        
        try {
            // Use template for AI response
            const template = document.getElementById('ai-response-template');
            const clone = document.importNode(template.content, true);
            
            // Set sentiment text and class
            const sentimentLabel = clone.querySelector('.text-sentiment-label');
            const sentimentValue = clone.querySelector('.text-sentiment-value');
            const sentimentContainer = clone.querySelector('.sentiment-container');
            
            if (sentimentLabel && sentimentValue && sentimentContainer) {
                // Handle both the new and old response formats
                let sentimentText = response.sentiment_label || 'Neutral';
                let sentimentClass = 'neutral';
                let score = response.sentiment_value || 0;
                
                // If using the new format (response.sentiment object)
                if (response.sentiment && typeof response.sentiment.score !== 'undefined') {
                    score = response.sentiment.score;
                    sentimentText = response.sentiment.label || sentimentText;
                }
                
                // Determine sentiment class based on score
                if (score >= 0.6) {
                    sentimentClass = 'very-positive';
                    sentimentText = 'Very Positive';
                } else if (score >= 0.2) {
                    sentimentClass = 'positive';
                    sentimentText = 'Positive';
                } else if (score >= -0.2) {
                    sentimentClass = 'neutral';
                    sentimentText = 'Neutral';
                } else if (score >= -0.6) {
                    sentimentClass = 'negative';
                    sentimentText = 'Negative';
                } else {
                    sentimentClass = 'very-negative';
                    sentimentText = 'Very Negative';
                }
                
                sentimentLabel.textContent = sentimentText;
                sentimentLabel.setAttribute('data-sentiment', sentimentClass);
                sentimentValue.textContent = score.toFixed(2);
                sentimentContainer.setAttribute('data-sentiment', sentimentClass);
            }
            
            // Set dominant emotion
            const dominantEmotion = clone.querySelector('.dominant-emotion');
            if (dominantEmotion) {
                // Handle both formats
                let emotionName = response.dominant_emotion || '';
                
                // If using new format with emotions object
                if (response.emotions && !emotionName) {
                    const strongest = Object.entries(response.emotions)
                        .sort((a, b) => b[1] - a[1])[0];
                    
                    if (strongest) {
                        emotionName = strongest[0];
                    }
                }
                
                if (emotionName) {
                    dominantEmotion.textContent = emotionName;
                    dominantEmotion.setAttribute('data-emotion', emotionName);
                }
            }
            
            // Set context info
            const relationshipType = clone.querySelector('.relationship-type');
            const trustLevel = clone.querySelector('.trust-level');
            const formalityLevel = clone.querySelector('.formality-level');
            
            if (response.context) {
                if (relationshipType) {
                    relationshipType.textContent = response.context.relationship_type || 
                                                 response.context.relationship || 'Unknown';
                }
                
                if (trustLevel) {
                    trustLevel.textContent = response.context.trust_level || 'Medium';
                }
                
                if (formalityLevel) {
                    formalityLevel.textContent = response.context.formality_level || 
                                               response.context.formality || 'Casual';
                }
            }
            
            // Add to chat
            chatHistory.appendChild(clone);
            
            // Initialize emotion chart with data
            const chart = document.querySelector('.chat-message:last-child .emotions-chart');
            if (chart && response.emotions) {
                // Set data attributes for each emotion for chart initialization
                for (const [emotion, value] of Object.entries(response.emotions)) {
                    chart.setAttribute(`data-${emotion.toLowerCase()}`, value);
                }
                
                // Initialize chart
                const chartId = 'emotion-chart-' + Date.now();
                chart.id = chartId;
                setTimeout(() => initChart(chart, chartId), 100);
            }
            
            // Scroll to the bottom
            scrollToBottom();
            
            // Re-enable the analyze button
            analyzeBtn.disabled = false;
        } catch (error) {
            console.error('Error adding AI response:', error);
        }
    }
    
    // Auto-scroll chat to bottom
    function scrollToBottom() {
        setTimeout(() => {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 50);
    }
    
    // Clear chat history
    function clearChat(resetSessionId = true) {
        console.log('Clearing chat...');
        
        // Remove all messages except the welcome message
        while (chatHistory.children.length > 1) {
            chatHistory.removeChild(chatHistory.lastChild);
        }
        
        // Create a new session if needed
        if (resetSessionId) {
            sessionId = generateSessionId();
            console.log('Generated new session ID:', sessionId);
        }
        
        // Reset session start time and message count
        sessionStartTime = new Date();
        messageCount = 0;
        
        // Clear any charts
        emotionsChart = null;
        
        console.log('Chat cleared');
    }
    
    // Show feedback modal
    function showFeedbackModal() {
        feedbackModal.classList.add('active');
        
        // Record the time when the feedback modal opened
        window.feedbackStartTime = new Date();
    }
    
    // Hide feedback modal
    function hideFeedbackModal() {
        feedbackModal.classList.remove('active');
        
        // Reset feedback form
        feedbackText.value = '';
        selectedRating = 0;
        ratingStars.forEach(star => star.classList.remove('active'));
    }
    
    // Submit feedback to the server
    async function submitFeedback() {
        const feedbackTime = new Date() - window.feedbackStartTime;
        
        // Prepare feedback data
        const feedbackData = {
            sessionId: sessionId,
            rating: selectedRating,
            feedback: feedbackText.value,
            timestamp: new Date().toISOString(),
            sessionMetrics: {
                duration: new Date() - sessionStartTime,
                messageCount: messageCount,
                feedbackTime: feedbackTime,
                relationship: relationshipSelect.value
            }
        };
        
        try {
            // Send feedback to server
            const response = await fetch('/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }
            
            // Hide modal after successful submission
            hideFeedbackModal();
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            // Store feedback locally if submission fails
            let storedFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
            storedFeedback.push(feedbackData);
            localStorage.setItem('pendingFeedback', JSON.stringify(storedFeedback));
            
            // Hide modal even if submission fails
            hideFeedbackModal();
        }
    }
    
    // Add a function to track message count and show feedback after certain interactions
    function updateMessageCountAndCheckFeedback() {
        messageCount++;
        
        // Show feedback after every 3 messages
        if (messageCount > 0 && messageCount % 3 === 0) {
            setTimeout(showFeedbackModal, 1000);
        }
        
        // Save current state
        saveChatHistory();
    }
    
    // Analyze emotions
    async function analyzeEmotions() {
        const text = textInput.value.trim();
        if (!text) return;
        
        // Add user message
        addUserMessage(text);
        
        // Clear input
        textInput.value = '';
        textInput.style.height = 'auto';
        analyzeBtn.disabled = true;
        
        // Add thinking message
        const thinkingTemplate = document.getElementById('ai-response-template');
        const thinkingClone = document.importNode(thinkingTemplate.content, true);
        thinkingClone.querySelector('.chat-message').classList.add('thinking-message');
        thinkingClone.querySelector('.message-content').innerHTML = '<p>Analyzing your message...</p><div class="loading-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        chatHistory.appendChild(thinkingClone);
        scrollToBottom();
        
        try {
            // Get relationship context
            const relationship = relationshipSelect.value;
            
            // Call API
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: text,
                    relationship: relationship,
                    sessionId: sessionId
                }),
            });
            
            // Remove thinking message
            chatHistory.removeChild(chatHistory.lastChild);
            
            if (!response.ok) {
                throw new Error('Failed to analyze emotions');
            }
            
            const data = await response.json();
            addAiResponse(data);
            
            // Update message count and check if we should show feedback
            updateMessageCountAndCheckFeedback();
            
        } catch (error) {
            console.error('Error:', error);
            
            // Remove thinking message
            chatHistory.removeChild(chatHistory.lastChild);
            
            // Add error message
            const errorTemplate = document.getElementById('ai-response-template');
            const errorClone = document.importNode(errorTemplate.content, true);
            errorClone.querySelector('.chat-message').classList.add('error-message');
            errorClone.querySelector('.message-content').innerHTML = `<p>Sorry, an error occurred: ${error.message}</p>`;
            chatHistory.appendChild(errorClone);
            scrollToBottom();
        }
    }
    
    // Add loading animation to stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
    .loading-indicator {
        display: flex;
        gap: 4px;
        margin-top: 8px;
        justify-content: center;
    }
    .loading-indicator .dot {
        width: 8px;
        height: 8px;
        background-color: var(--text-light);
        border-radius: 50%;
        animation: loadingPulse 1.4s infinite ease-in-out;
    }
    .loading-indicator .dot:nth-child(2) {
        animation-delay: 0.2s;
    }
    .loading-indicator .dot:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes loadingPulse {
        0%, 100% { transform: scale(0.5); opacity: 0.5; }
        50% { transform: scale(1); opacity: 1; }
    }
    `;
    document.head.appendChild(style);
    
    // Setup rating stars
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            selectedRating = value;
            
            // Update UI to show rating
            ratingStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Event listeners
    analyzeBtn.addEventListener('click', throttle(analyzeEmotions, 1000));
    newChatBtn.addEventListener('click', clearChat);
    historyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('History button clicked');
        showChatHistoryList();
    });
    feedbackSubmit.addEventListener('click', submitFeedback);
    feedbackSkip.addEventListener('click', hideFeedbackModal);
    
    // Add event listener for page unload to show feedback prompt
    window.addEventListener('beforeunload', function(e) {
        // Only show feedback if there were messages in this session and dialog isn't already open
        if (messageCount > 0 && !feedbackModal.classList.contains('active')) {
            // Store a flag in localStorage that we want to show feedback on next load
            localStorage.setItem('showFeedbackOnLoad', 'true');
        }
    });
    
    // Check if we need to show feedback on page load
    if (localStorage.getItem('showFeedbackOnLoad') === 'true') {
        // Clear the flag
        localStorage.removeItem('showFeedbackOnLoad');
        // Show the feedback if we have messages
        if (messageCount > 0) {
            setTimeout(showFeedbackModal, 1000);
        }
    }
    
    // Check for pending feedback submissions on page load
    function checkPendingFeedback() {
        const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
        if (pendingFeedback.length > 0) {
            // Attempt to submit pending feedback
            pendingFeedback.forEach(async (feedback, index) => {
                try {
                    const response = await fetch('/feedback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(feedback),
                    });
                    
                    if (response.ok) {
                        // Remove this feedback from pending list
                        pendingFeedback.splice(index, 1);
                        localStorage.setItem('pendingFeedback', JSON.stringify(pendingFeedback));
                    }
                } catch (error) {
                    console.error('Error submitting pending feedback:', error);
                    // Leave it in pending for next attempt
                }
            });
        }
    }
    
    // Check for pending feedback on startup
    checkPendingFeedback();

    // Add a function to show chat history list for loading previous chats
    function showChatHistoryList() {
        console.log('Showing chat history list...');
        
        try {
            const chatHistoryArray = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            console.log('Retrieved chat history from localStorage:', chatHistoryArray.length, 'chats found');
            
            if (chatHistoryArray.length === 0) {
                alert("No saved conversations found");
                return;
            }
            
            // Create modal for history selection
            const modal = document.createElement('div');
            modal.className = 'feedback-modal active';
            modal.id = 'history-modal';
            
            const content = document.createElement('div');
            content.className = 'feedback-content';
            
            const header = document.createElement('div');
            header.className = 'feedback-header';
            header.innerHTML = '<h3>Previous Conversations</h3>';
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'X';  // Simple X character instead of font awesome
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '1rem';
            closeBtn.style.right = '1rem';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '1.25rem';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = 'var(--text-secondary)';
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
                console.log('Chat history modal closed');
            });
            
            const list = document.createElement('div');
            list.style.maxHeight = '400px';
            list.style.overflowY = 'auto';
            list.style.marginBottom = '1rem';
            
            chatHistoryArray.forEach((chat, index) => {
                console.log(`Processing chat ${index + 1}/${chatHistoryArray.length}`);
                
                const item = document.createElement('div');
                item.style.padding = '0.75rem';
                item.style.margin = '0.5rem 0';
                item.style.borderRadius = 'var(--radius-md)';
                item.style.backgroundColor = 'var(--background-color)';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.2s ease';
                
                // Get first message content
                let firstMessage = "Empty conversation";
                if (chat.messages && chat.messages.length > 0) {
                    if (chat.messages[0].type === 'user') {
                        firstMessage = chat.messages[0].content;
                    } else if (chat.messages.length > 1) {
                        firstMessage = chat.messages[1].content;
                    }
                    
                    // Clean up HTML and truncate
                    firstMessage = firstMessage.replace(/<\/?[^>]+(>|$)/g, "");
                    firstMessage = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
                }
                
                const date = new Date(chat.startTime);
                item.innerHTML = `
                    <div style="font-weight: 500;">${firstMessage}</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-light);">
                        <span>Relationship: ${chat.relationship}</span>
                        <span>${date.toLocaleString()}</span>
                    </div>
                `;
                
                item.addEventListener('mouseover', function() {
                    item.style.backgroundColor = 'var(--border-color)';
                });
                
                item.addEventListener('mouseout', function() {
                    item.style.backgroundColor = 'var(--background-color)';
                });
                
                item.addEventListener('click', function() {
                    console.log(`Loading chat with ID: ${chat.id}`);
                    window.location.href = `/?continue=${chat.id}`;
                });
                
                list.appendChild(item);
            });
            
            content.appendChild(closeBtn);
            content.appendChild(header);
            
            // Add instructions
            const instructions = document.createElement('p');
            instructions.style.margin = '0.5rem 0 1rem';
            instructions.style.fontSize = '0.9rem';
            instructions.textContent = 'Click on a conversation to load it:';
            content.appendChild(instructions);
            
            content.appendChild(list);
            modal.appendChild(content);
            document.body.appendChild(modal);
            console.log('Chat history modal displayed');
        } catch (error) {
            console.error('Error showing chat history list:', error);
            alert('There was an error loading chat history. Please try again.');
        }
    }

    // For debugging: Add a console log to show localStorage contents
    console.log('Current localStorage chatHistory:', localStorage.getItem('chatHistory'));
}); 