import { supabase } from '../integrations/supabase/supabase';

export const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const getPublicUrl = async (
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
};

export const getSignedUrl = async (
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

export const getFileMetadata = async (
  bucket: string,
  path: string
): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 1,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      // Convert FileObject to Record<string, unknown>
      const fileObject = data[0];
      const metadata: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fileObject)) {
        metadata[key] = value;
      }
      return metadata;
    }

    return null;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
};

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const path = `${userId}/avatar.png`;
    const { error } = await supabase.storage
      .from('Media_Chitchat')
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('Media_Chitchat')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
};
