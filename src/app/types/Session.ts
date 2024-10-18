import { v4 as uuidv4 } from 'uuid';

export enum SessionType {
  General = 'General',
  StoryMode = 'StoryMode',
  ResearchCreateMode = 'ResearchCreateMode',
}

export interface Session {
  id: string;
  user_id: string;
  ai_friend_ids: string[];
  session_type: SessionType;
  title: string;
  description: string;
  characters_and_relationships?: string;
  team_members?: string;
  project_description?: string;
  created_at: string;
  updated_at: string;
}

export const createSession = (
  user_id: string,
  ai_friend_ids: string[],
  session_type: SessionType,
  sessionData: {
    title: string;
    description: string;
    charactersAndRelationships?: string;
    teamMembers?: string;
    projectDescription?: string;
  }
): Session => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    user_id,
    ai_friend_ids,
    session_type,
    title: sessionData.title,
    description: sessionData.description,
    characters_and_relationships: sessionData.charactersAndRelationships,
    team_members: sessionData.teamMembers,
    project_description: sessionData.projectDescription,
    created_at: now,
    updated_at: now,
  };
};
