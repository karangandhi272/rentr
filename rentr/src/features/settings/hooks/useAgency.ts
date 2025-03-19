import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Agency, AgencyAddress } from '../types';

export function useAgencyDetails(agencyId?: string) {
  return useQuery({
    queryKey: ['agency', agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', agencyId)
          .single();
        
        if (error) throw error;
        return data as Agency;
      } catch (err) {
        console.error("Error fetching agency details:", err);
        throw err;
      }
    },
    enabled: !!agencyId,
  });
}

export function useUpdateAgency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agencyData: {
      id: string;
      name: string;
      description?: string;
      email?: string;
      phone?: string;
      website?: string;
      address?: AgencyAddress;
    }) => {
      try {
        const { id, ...updates } = agencyData;
        
        const { error } = await supabase
          .from('agencies')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error("Error updating agency:", err);
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agency', variables.id] });
    },
  });
}

export function useUploadAgencyLogo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ agencyId, file }: { agencyId: string; file: File }) => {
      try {
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `agency-${agencyId}-logo-${Date.now()}.${fileExt}`;
        const filePath = `agency-logos/${fileName}`;
        
        // Upload the file to storage
        const { error: uploadError } = await supabase
          .storage
          .from('agency-assets')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: publicURL } = supabase
          .storage
          .from('agency-assets')
          .getPublicUrl(filePath);
        
        if (!publicURL) throw new Error("Failed to get public URL for uploaded logo");
        
        // Update agency with new logo URL
        const { error: updateError } = await supabase
          .from('agencies')
          .update({
            logo_url: publicURL.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', agencyId);
        
        if (updateError) throw updateError;
        
        return { success: true, logo_url: publicURL.publicUrl };
      } catch (err) {
        console.error("Error uploading agency logo:", err);
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agency', variables.agencyId] });
    },
  });
}
