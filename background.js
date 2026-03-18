chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ lastPrompt: '' });

  if (chrome.sidePanel?.setPanelBehavior) {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEND_TO_BOTH') {
    dispatchPrompt(message.prompt)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'CONTENT_RESPONSE') {
    return false;
  }
});

async function dispatchPrompt(prompt) {
  await chrome.storage.local.set({ lastPrompt: prompt });

  const tabs = await chrome.tabs.query({});
  const chatgptTab = tabs.find((tab) => tab.url?.startsWith('https://chatgpt.com/'));
  const claudeTab = tabs.find((tab) => tab.url?.includes('claude.ai/'));

  if (chatgptTab?.id) {
    chrome.tabs.sendMessage(chatgptTab.id, { type: 'INJECT_PROMPT', prompt, provider: 'chatgpt' });
  }

  if (claudeTab?.id) {
    chrome.tabs.sendMessage(claudeTab.id, { type: 'INJECT_PROMPT', prompt, provider: 'claude' });
  }

  if (!chatgptTab && !claudeTab) {
    throw new Error('未找到 ChatGPT 或 Claude 标签页');
  }
}
