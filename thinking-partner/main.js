const chat = document.getElementById('chat');
const input = document.getElementById('input');
const submitBtn = document.getElementById('submit');

const messages = [];

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

  input.value = '';
  input.style.height = 'auto';
  submitBtn.disabled = true;

  addMessage('user', text);
  messages.push({ role: 'user', content: text });

  const loader = addLoading();

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    loader.remove();

    addMessage('assistant', data.text);
    messages.push({ role: 'assistant', content: data.text });
  } catch {
    loader.remove();
    addMessage('assistant', 'Something went wrong. Try again.');
  }

  submitBtn.disabled = false;
  input.focus();
}
