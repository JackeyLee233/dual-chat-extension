let __dualChatChatgptSending = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'INJECT_PROMPT') handlePrompt(message.prompt);
});

async function handlePrompt(prompt) {
  if (__dualChatChatgptSending) return;

  __dualChatChatgptSending = true;
  try {
    const editable =
      document.querySelector('.wcDTda_prosemirror-parent [contenteditable="true"]') ||
      document.querySelector('.wcDTda_prosemirror-parent .ProseMirror') ||
      document.querySelector('[contenteditable="true"]');

    if (!editable) {
      await sendProviderResponse('chatgpt', 'error', '未找到 ChatGPT contenteditable 编辑器');
      return;
    }

    editable.focus();
    editable.click();
    editable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    editable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    editable.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(120);

    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
    } catch {}

    if (!(editable.innerText || '').trim()) {
      editable.textContent = prompt;
      editable.dispatchEvent(new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: prompt,
        inputType: 'insertText'
      }));
      editable.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: prompt,
        inputType: 'insertText'
      }));
    }

    await wait(1000);

    const sendButton = findSendButton();
    if (sendButton && !sendButton.disabled) {
      clickButton(sendButton);
      return;
    }

    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true
    }));
    editable.dispatchEvent(new KeyboardEvent('keypress', {
      key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true
    }));
    editable.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true
    }));
  } catch (error) {
    await sendProviderResponse('chatgpt', 'error', error.message);
  } finally {
    setTimeout(() => {
      __dualChatChatgptSending = false;
    }, 1500);
  }
}

function findSendButton() {
  return (
    document.querySelector('#composer-submit-button') ||
    document.querySelector('button[data-testid="send-button"]') ||
    document.querySelector('button[aria-label*="发送提示"]') ||
    document.querySelector('button[aria-label*="Send prompt"]') ||
    document.querySelector('button[aria-label*="发送"]') ||
    [...document.querySelectorAll('button')].find((btn) => {
      const aria = btn.getAttribute('aria-label') || '';
      const testid = btn.getAttribute('data-testid') || '';
      return /send/i.test(aria) || /send-button/i.test(testid);
    })
  );
}

function clickButton(button) {
  button.focus();
  button.click();
}
