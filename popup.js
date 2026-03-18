const promptEl = document.getElementById('prompt');
const statusEl = document.getElementById('status');

document.getElementById('send').addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) return;
  statusEl.textContent = '发送中...';
  const result = await chrome.runtime.sendMessage({ type: 'SEND_TO_BOTH', prompt });
  statusEl.textContent = result?.ok ? '已发送到已打开的官方页面' : `发送失败：${result?.error || 'unknown'}`;
});

document.getElementById('openPanel').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.windowId != null && chrome.sidePanel?.open) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    window.close();
  }
});
