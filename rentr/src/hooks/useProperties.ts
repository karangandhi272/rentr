import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '@/api/properties';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

// Hook for fetching the current user's agency properties
export const useUserAgencyProperties = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['properties', 'userAgency', user?.id],
    queryFn: propertiesApi.fetchUserProperties,
    enabled: !!user,
  });
};

// Hook for fetching a specific agency's properties
export const useAgencyProperties = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['properties', 'agency', agencyId],
    queryFn: () => agencyId ? propertiesApi.fetchAgencyProperties(agencyId) : Promise.resolve([]),
    enabled: !!agencyId,
  });
};

// Hook for fetching a specific property
export const useProperty = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['properties', 'detail', propertyId],
    queryFn: () => propertyId ? propertiesApi.fetchPropertyById(propertyId) : Promise.resolve(null),
    enabled: !!propertyId,
  });
};

// Hook for creating a new property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // First get the user's agency ID
  const getUserAgencyId = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('agencyid')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data?.agencyid;
  };
  
  return useMutation({
    mutationFn: propertiesApi.createProperty,
    onSuccess: async (data) => {
      // Get the agency ID to invalidate the proper queries
      const agencyId = data.agencyid || await getUserAgencyId();
      
      // Invalidate all relevant queries
      if (agencyId) {
        queryClient.invalidateQueries({
          queryKey: ['properties', 'agency', agencyId],
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: ['properties', 'userAgency'],
      });
    },
  });
};

// Hook for updating a property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ propertyId, updates }: { propertyId: string; updates: any }) => 
      propertiesApi.updateProperty(propertyId, updates),
    onSuccess: (_, variables) => {
      // Invalidate the specific property
      queryClient.invalidateQueries({
        queryKey: ['properties', 'detail', variables.propertyId],
      });
      
      // Invalidate all property lists as this could affect them
      queryClient.invalidateQueries({
        queryKey: ['properties', 'agency'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['properties', 'userAgency'],
      });
    },
  });
};

// Hook to get property questions
export const usePropertyQuestions = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['propertyQuestions', propertyId],
    queryFn: () => propertyId ? propertiesApi.fetchPropertyQuestions(propertyId) : Promise.resolve([]),
    enabled: !!propertyId,
  });
};

// Export other hooks as needed
export const usePropertyImages = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['propertyImages', propertyId],
    queryFn: () => propertyId ? propertiesApi.fetchPropertyImages(propertyId) : Promise.resolve([]),
    enabled: !!propertyId,
  });
};
