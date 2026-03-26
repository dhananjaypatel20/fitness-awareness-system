// Initialize Chat Widget HTML
const chatHTML = `
  <button class="chat-toggle" id="chat-toggle" title="Chat with AI">
    💬
  </button>
  <div class="chat-widget" id="chat-widget">
    <div class="chat-header">
      <span>AI Diet & Fitness Assistant</span>
      <button class="chat-close" id="chat-close">&times;</button>
    </div>
    <div class="chat-body" id="chat-body">
      <div class="chat-message bot">Hello! I am your AI assistant here to help you with weight loss and diet plans. How can I help you today?</div>
    </div>
    <div class="chat-input">
      <input type="text" id="chat-input-text" placeholder="Ask about diet/weight loss..." onkeypress="handleChatEnter(event)">
      <button onclick="sendMessage()" id="chat-send">➤</button>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatClose = document.getElementById('chat-close');
const chatBody = document.getElementById('chat-body');
const chatInputText = document.getElementById('chat-input-text');
const chatSend = document.getElementById('chat-send');

chatToggle.addEventListener('click', () => {
  chatWidget.classList.add('active');
  chatToggle.style.display = 'none';
});

chatClose.addEventListener('click', () => {
  chatWidget.classList.remove('active');
  setTimeout(() => {
    chatToggle.style.display = 'flex';
  }, 300);
});

function handleChatEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

async function sendMessage() {
  const text = chatInputText.value.trim();
  if (!text) return;

  // Add User Message
  addMessage(text, 'user');
  chatInputText.value = '';

  // Show thinking
  const thinkingId = addMessage('Thinking...', 'bot', true);

  try {
    const response = await fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: text })
    });

    const data = await response.json();
    
    // Remove thinking message
    const msgEl = document.getElementById(thinkingId);
    if (msgEl) msgEl.remove();

    if (response.ok) {
        addMessage(data.reply, 'bot');
    } else {
        addMessage(data.message || 'Error getting response.', 'bot');
    }
  } catch (err) {
    const msgEl = document.getElementById(thinkingId);
    if (msgEl) msgEl.remove();
    addMessage('Connection error. Is the AI server running?', 'bot');
  }
}

function addMessage(text, sender, isTemp = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}`;
  msgDiv.textContent = text;
  
  const id = 'msg-' + Date.now();
  if (isTemp) msgDiv.id = id;

  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  return id;
}
