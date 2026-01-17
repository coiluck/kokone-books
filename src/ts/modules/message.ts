// message.ts
export function showMessage(message: string) {
  const container = document.getElementById('message-container');
  if (!container)  return;

  const messageItem = document.createElement('div');
  messageItem.className = 'message-item';
  messageItem.textContent = message;
  container.appendChild(messageItem);

  setTimeout(() => {
    messageItem.remove();
  }, 5000);
}