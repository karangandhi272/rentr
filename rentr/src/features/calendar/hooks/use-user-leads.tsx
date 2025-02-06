import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export const useUserLeads = () => {
  const { user } = useAuth();
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryFn: async () => {
      const { data: properties, error } = await supabase
        .from("property")
        .select("propertyid")
        .eq("userid", user?.id);

      if (error) throw error;
      return properties?.map((p) => p.propertyid) || []; // Return only the property IDs
    },
    queryKey: ["properties", user?.id],
    enabled: !!user, // Only run when user is defined
  });

  // Step 2: Fetch leads for user's properties
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryFn: async () => {
      if (!properties || properties.length === 0) return []; // No properties, return empty

      const { data: leads, error } = await supabase
        .from("leads")
        .select(
          `
          id,
          name,
          date,
          property,
          property_details:property(
            propertyid,
            name,
            address
          )
        `
        )
        .in("property", properties) // Fetch leads only for user's properties
        .order("created_at", { ascending: true });

      if (error) throw error;
      return leads;
    },
    queryKey: ["leads", properties], // Depend on property IDs
    enabled: !!properties && properties.length > 0, // Wait for properties to load
  });

  return {
    leads,
    isLoading: propertiesLoading || leadsLoading,
  };
};
