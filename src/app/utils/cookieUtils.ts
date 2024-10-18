import Cookies from 'js-cookie';

export const setConversationId = (conversationId: string) => {
  Cookies.set('conversationId', conversationId);
};

export const getConversationId = (): string | undefined => {
  return Cookies.get('conversationId');
};
