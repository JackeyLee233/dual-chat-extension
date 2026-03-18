chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'INJECT_PROMPT') handlePrompt(message.prompt);
});

async function handlePrompt(prompt) {
  try {
    const input =
      document.querySelector('div[contenteditable="true"][enterkeyhint], div[contenteditable="true"], textarea');

    if (!input) {
      await sendProviderResponse('claude', 'error', '未找到 Claude 输入框');
      return;
    }

    input.focus();

    if (input.tagName === 'TEXTAREA') {
      input.value = prompt;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      input.textContent = prompt;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: prompt, inputType: 'insertText' }));
    }

    await wait(250);

    const sendButton =
      document.querySelector('button[aria-label*="Send"], button[aria-label*="发送"]') ||
      [...document.querySelectorAll('button')].find((btn) => {
        const label = (btn.getAttribute('aria-label') || btn.innerText || '').trim();
        return /send|发送/i.test(label);
      });

    if (sendButton && !sendButton.disabled) {
      sendButton.click();
      await sendProviderResponse('claude', 'sent', 'ok');
      return;
    }

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
    await sendProviderResponse('claude', 'sent', 'ok');
  } catch (error) {
    await sendProviderResponse('claude', 'error', error.message);
  }
}
