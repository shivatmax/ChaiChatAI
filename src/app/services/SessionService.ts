import { Session, SessionType } from '../types/Session';
import { supabase } from '../integrations/supabase';
import { v4 as uuidv4 } from 'uuid';
import { clearStoredSessionDescription } from './ResponseGenerationService';
import { logger } from '../utils/logger';
interface SessionData {
  title: string;
  description: string;
  session_type: SessionType;
}

export const createNewSession = async (
  userId: string,
  aiFriendIds: string[],
  sessionType: SessionType,
  sessionData: SessionData
): Promise<Session> => {
  try {
    const newSessionId = uuidv4();
    const now = new Date().toISOString();
    const dataString = JSON.stringify(sessionData);
    logger.debug('dataString', dataString);
    const { data, error } = await supabase
      .from('Session')
      .insert([
        {
          id: newSessionId,
          user_id: userId,
          ai_friend_ids: aiFriendIds,
          session_type: sessionType,
          title: sessionData.title,
          description: dataString,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error creating new session:', error);
    throw error;
  }
};

export const getSessions = async (userId: string): Promise<Session[]> => {
  try {
    const { data, error } = await supabase
      .from('Session')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((session) => ({
      ...session,
      session_type: session.session_type as SessionType,
      description: parseDescription(session.description),
      created_at: session.created_at,
      updated_at: session.updated_at,
    }));
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    throw error;
  }
};

const parseDescription = (description: string): unknown => {
  try {
    return JSON.parse(description);
  } catch (error) {
    logger.error('Error parsing description:', error);
    return { description };
  }
};

export const getLatestSession = async (
  userId: string
): Promise<Session | null> => {
  try {
    const { data, error } = await supabase
      .from('Session')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No sessions found
      }
      throw error;
    }
    return {
      ...data,
      session_type: data.session_type as SessionType,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    logger.error('Error fetching latest session:', error);
    throw error;
  }
};

export const updateSession = async (
  sessionId: string,
  updates: Partial<Session>
): Promise<Session> => {
  try {
    const { data, error } = await supabase
      .from('Session')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    clearStoredSessionDescription(sessionId);
    return data;
  } catch (error) {
    logger.error('Error updating session:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('Session')
      .delete()
      .eq('id', sessionId);
    if (error) throw error;
    clearStoredSessionDescription(sessionId);
  } catch (error) {
    logger.error('Error deleting session:', error);
    throw error;
  }
};

//getsessiondata
export const getSessionData = async (
  sessionId: string
): Promise<SessionData> => {
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  // logger.debug('data', data);
  return data;
};
