function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendProviderResponse(provider, status, text) {
  await chrome.runtime.sendMessage({
    type: 'CONTENT_RESPONSE',
    payload: { provider, status, text }
  });
}
