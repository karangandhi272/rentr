import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Availability } from '../types';

export function useUpdateUserAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, availability }: { userId: string, availability: Availability }) => {
      const { error } = await supabase
        .from('users')
        .update({ 
          availability,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    }
  });
}

export function useGetUserAvailability(userId: string | undefined) {
  return useQuery({
    queryKey: ['userAvailability', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('availability')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.availability as Availability | null;
    },
    enabled: !!userId
  });
}