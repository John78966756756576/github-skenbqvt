const API_KEY = '1bG0onwaw9s4ZEi7TRS0eXHAPcES0yqF';
const API_URL = 'https://api.mistral.ai/v1/chat/completions';

let conversationHistory = [];
let isTyping = false;

// Typing animation for bot messages
function createTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    return typingDiv;
}

function addMessage(message, isUser) {
    const main = document.querySelector('main');
    
    // Remove welcome section if it exists
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => welcomeSection.remove(), 300);
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = timestamp;
    
    // Create message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeSpan);
    
    // Insert before quick access section
    const quickAccess = document.querySelector('.quick-access');
    main.insertBefore(messageDiv, quickAccess);
    
    // Consistent scrolling behavior for bot messages
    if (!isUser) {
        const scrollToMessage = () => {
            const messageRect = messageDiv.getBoundingClientRect();
            const containerRect = main.getBoundingClientRect();
            const isFullyVisible = messageRect.top >= containerRect.top && 
                                 messageRect.bottom <= containerRect.bottom;

            if (!isFullyVisible) {
                const targetScroll = messageDiv.offsetTop - 20; // Add some padding
                main.scrollTo({
                    top: Math.max(0, Math.min(targetScroll, main.scrollHeight - main.offsetHeight)),
                    behavior: 'smooth'
                });
            }
        };

        // Initial scroll after message is added
        setTimeout(scrollToMessage, 100);

        // Ensure message is visible after any animations
        messageDiv.addEventListener('animationend', scrollToMessage);
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    const sendBtn = document.querySelector('.send-btn');
    
    if (!message || isTyping) return;
    
    // Disable input and button while processing
    userInput.disabled = true;
    sendBtn.disabled = true;
    isTyping = true;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    
    // Add user message to conversation history
    conversationHistory.push({
        role: "user",
        content: message
    });
    
    // Show typing indicator
    const main = document.querySelector('main');
    const typingIndicator = createTypingIndicator();
    const quickAccess = document.querySelector('.quick-access');
    main.insertBefore(typingIndicator, quickAccess);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-tiny",
                messages: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.choices && data.choices[0]) {
            const botResponse = data.choices[0].message.content;
            
            // Add bot response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: botResponse
            });
            
            // Add bot message to chat
            addMessage(botResponse, false);
            
            // Update recent prompts
            updateRecentPrompts(message);
        } else {
            addMessage("Sorry, I couldn't process your request.", false);
        }
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage("Sorry, there was an error processing your request.", false);
    } finally {
        // Re-enable input and button
        userInput.disabled = false;
        sendBtn.disabled = false;
        isTyping = false;
        userInput.focus();
    }
}

function updateRecentPrompts(message) {
    const recentPrompts = document.querySelector('.recent-prompts');
    const promptItem = document.createElement('div');
    promptItem.className = 'prompt-item';
    promptItem.innerHTML = `
        <img src="https://cdn.jsdelivr.net/npm/heroicons/outline/clock.svg" alt="recent" class="prompt-icon">
        <span>${message}</span>
    `;
    
    // Add click handler to reuse prompt
    promptItem.addEventListener('click', () => {
        document.getElementById('user-input').value = message;
        document.getElementById('user-input').focus();
    });
    
    recentPrompts.insertBefore(promptItem, recentPrompts.firstChild);
}

// Quick access card click handlers
document.querySelectorAll('.quick-card').forEach(card => {
    card.addEventListener('click', () => {
        const topic = card.querySelector('h3').textContent;
        const message = `Tell me about ${topic.toLowerCase()}`;
        document.getElementById('user-input').value = message;
        sendMessage();
    });
});

// Allow sending message with Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Input focus handler
document.getElementById('user-input').addEventListener('focus', () => {
    document.querySelector('.chat-input').classList.add('focused');
});

document.getElementById('user-input').addEventListener('blur', () => {
    document.querySelector('.chat-input').classList.remove('focused');
});