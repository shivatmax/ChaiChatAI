import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  name: string;
  conversationHistory: unknown[]; // Replace 'any' with your ConversationHistory type
}

export const useSessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Load sessions from localStorage on component mount
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    // Save sessions to localStorage whenever they change
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, [sessions]);

  const createSession = (name: string = 'New Session') => {
    const newSession: Session = {
      id: uuidv4(),
      name,
      conversationHistory: [],
    };
    setSessions((prevSessions) => [...prevSessions, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession;
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const updateSessionName = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId)
    );
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(
        (session) => session.id !== sessionId
      );
      setCurrentSessionId(remainingSessions[0]?.id || null);
    }
  };

  const addMessageToCurrentSession = (message: unknown) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              conversationHistory: [...session.conversationHistory, message],
            }
          : session
      )
    );
  };

  const getCurrentSession = () => {
    return sessions.find((session) => session.id === currentSessionId) || null;
  };

  return {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    updateSessionName,
    deleteSession,
    addMessageToCurrentSession,
    getCurrentSession,
  };
};
