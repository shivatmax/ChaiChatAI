const MAX_CONVERSATIONS = 10;

export const getLastConversations = (sessionId: string): string[] => {
  const key = `conversation_${sessionId}`;
  const storedConversations = localStorage.getItem(key);
  if (storedConversations) {
    return JSON.parse(storedConversations);
  }
  return [];
};

export const addConversation = (sessionId: string, message: string): void => {
  const key = `conversation_${sessionId}`;
  const conversations = getLastConversations(sessionId);
  conversations.push(message);
  if (conversations.length > MAX_CONVERSATIONS) {
    conversations.shift();
  }
  localStorage.setItem(key, JSON.stringify(conversations));
};
