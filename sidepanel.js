const promptEl = document.getElementById('prompt');
const statusEl = document.getElementById('sendStatus');
const sendButton = document.getElementById('send');
const sendHotkeyEl = document.getElementById('sendHotkey');

async function render() {
  const state = await chrome.storage.local.get(['lastPrompt', 'sendHotkey']);
  if (state.lastPrompt && !promptEl.value) promptEl.value = state.lastPrompt;
  sendHotkeyEl.value = state.sendHotkey || 'enter';
}

async function submitPrompt() {
  const prompt = promptEl.value.trim();
  if (!prompt) return;

  statusEl.textContent = '发送中...';
  sendButton.disabled = true;

  try {
    const result = await chrome.runtime.sendMessage({ type: 'SEND_TO_BOTH', prompt });
    if (!result?.ok) {
      statusEl.textContent = `发送失败：${result?.error || 'unknown'}`;
      return;
    }

    promptEl.value = '';
    await chrome.storage.local.set({ lastPrompt: '' });
    statusEl.textContent = '已发送到已打开的官方页面';
    promptEl.focus();
  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener('click', submitPrompt);

sendHotkeyEl.addEventListener('change', async () => {
  await chrome.storage.local.set({ sendHotkey: sendHotkeyEl.value });
  promptEl.focus();
});

promptEl.addEventListener('keydown', async (event) => {
  if (event.isComposing) return;
  if (event.key !== 'Enter') return;

  const mode = sendHotkeyEl.value || 'enter';
  const plainEnter = !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
  const ctrlEnter = event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;

  const shouldSend =
    (mode === 'enter' && plainEnter) ||
    (mode === 'ctrlEnter' && ctrlEnter);

  const shouldInsertNewline =
    (mode === 'enter' && ctrlEnter) ||
    (mode === 'ctrlEnter' && plainEnter);

  if (shouldSend) {
    event.preventDefault();
    await submitPrompt();
    return;
  }

  if (shouldInsertNewline) {
    event.preventDefault();
    insertNewlineAtCursor(promptEl);
  }
});

function insertNewlineAtCursor(textarea) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const value = textarea.value;
  textarea.value = `${value.slice(0, start)}\n${value.slice(end)}`;
  textarea.selectionStart = textarea.selectionEnd = start + 1;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.lastPrompt || changes.sendHotkey) render();
});

render();
