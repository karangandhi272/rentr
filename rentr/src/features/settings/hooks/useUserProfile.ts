import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: { name: string; phone_number?: string; bio?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone_number: profileData.phone_number,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
}

export function useUpdateProfileImage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('user-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('user-assets')
        .getPublicUrl(filePath);
      
      // Update the user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_picture: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      return { 
        success: true,
        url: publicUrl
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
}