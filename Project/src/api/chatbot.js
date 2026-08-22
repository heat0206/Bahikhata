// --- Chatbot API Helper ---
// Sends a chat message to the Express backend chatbot endpoint.

const BASE_URL = import.meta.env.VITE_API_URL || '';
const CHATBOT_URL = `${BASE_URL}/api/chatbot`;

export async function sendChatMessage(message, pendingAction = null) {
  const body = { message };
  if (pendingAction) {
    body.pendingAction = pendingAction;
  }

  const res = await fetch(CHATBOT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    // The server returns { reply, refreshNeeded } even on errors
    return {
      reply: json.reply || 'Something went wrong. Please try again.',
      refreshNeeded: json.refreshNeeded || false,
      error: true,
    };
  }

  return json;
}
