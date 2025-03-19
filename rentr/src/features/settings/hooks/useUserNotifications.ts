import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { NotificationPreferences } from '../types';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_new_leads: true,
  email_application_updates: true,
  email_team_changes: true,
  sms_new_leads: false,
  sms_application_updates: false,
  browser_notifications: true,
};

// Get user notification preferences
export function useUserNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ['notificationPreferences', userId],
    queryFn: async () => {
      if (!userId) return DEFAULT_PREFERENCES;
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If not found, return default preferences
        if (error.code === 'PGRST116') {
          return DEFAULT_PREFERENCES;
        }
        throw error;
      }
      
      return data as NotificationPreferences;
    },
    enabled: !!userId
  });
}

// Update user notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      preferences 
    }: { 
      userId: string, 
      preferences: NotificationPreferences 
    }) => {
      // Check if preferences record exists
      const { data, error: checkError } = await supabase
        .from('user_notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('user_notification_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_notification_preferences')
          .insert([{
            user_id: userId,
            ...preferences,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['notificationPreferences', variables.userId] 
      });
    }
  });
}
