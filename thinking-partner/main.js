const chat = document.getElementById('chat');
const input = document.getElementById('input');
const submitBtn = document.getElementById('submit');
const keyOverlay = document.getElementById('key-overlay');
const keyInputOverlay = document.getElementById('key-input-overlay');

const messages = [];

// Show overlay on load if no key saved
window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('gemini_key')) showKeyOverlay();
});

function showKeyOverlay() {
  keyOverlay.classList.remove('hidden');
  keyInputOverlay.value = localStorage.getItem('gemini_key') || '';
  keyInputOverlay.focus();
}

function saveKey() {
  const key = keyInputOverlay.value.trim();
  if (!key) return;
  localStorage.setItem('gemini_key', key);
  keyOverlay.classList.add('hidden');
  input.focus();
}

keyInputOverlay.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveKey();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
});

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;

  if (role === 'assistant') {
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = 'The Council';
    div.appendChild(label);
  }

  const content = document.createElement('div');
  content.textContent = text;
  div.appendChild(content);

  chat.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return div;
}

function addLoading() {
  const div = document.createElement('div');
  div.className = 'message loading';
  div.textContent = 'The council is deliberating...';
  chat.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return div;
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  const apiKey = localStorage.getItem('gemini_key');
  if (!apiKey) { showKeyOverlay(); return; }

  input.value = '';
  submitBtn.disabled = true;

  addMessage('user', text);
  messages.push({ role: 'user', content: text });

  const loader = addLoading();

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, apiKey })
    });

    const data = await res.json();
    loader.remove();

    if (data.error) {
      addMessage('assistant', `Error: ${data.error}`);
      messages.pop();
    } else {
      addMessage('assistant', data.text);
      messages.push({ role: 'assistant', content: data.text });
    }
  } catch {
    loader.remove();
    addMessage('assistant', 'Something went wrong. Try again.');
    messages.pop();
  }

  submitBtn.disabled = false;
  input.focus();
}
