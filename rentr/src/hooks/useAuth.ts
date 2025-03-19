import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        console.log("Fetching user profile for ID:", user.id);
        
        // Query the users table which should contain all profile information
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          throw error;
        }
        
        console.log("User profile data:", data);
        
        // Fix role if it's not matching the enum
        if (data && data.role && typeof data.role === 'string') {
          // Convert to proper Role enum value
          if (data.role.toLowerCase() === 'admin') {
            data.role = Role.Admin;
          } else if (data.role.toLowerCase() === 'user') {
            data.role = Role.User;
          }
        }
        
        return data;
      } catch (err) {
        console.error("Exception in useUserProfile:", err);
        throw err;
      }
    },
    enabled: !!user,
  });
}

export function useSignOut() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/auth');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    },
  });
}