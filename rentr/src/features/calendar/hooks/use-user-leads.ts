import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Get calendar events based on leads for properties within the user's agency
 */
export const useUserLeads = () => {
  const { user } = useAuth();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ["calendarLeads", user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // First get the user's agency ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("agencyid")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Failed to get user agency:", userError);
          return [];
        }

        if (!userData?.agencyid) {
          console.log("User has no agency association");
          return [];
        }

        // Get all properties for the agency
        const { data: properties, error: propsError } = await supabase
          .from("property")
          .select("propertyid")
          .eq("agencyid", userData.agencyid);

        if (propsError) {
          console.error("Failed to fetch agency properties:", propsError);
          return [];
        }

        if (!properties || properties.length === 0) {
          return [];
        }

        const agencyPropertyIds = properties.map(p => p.propertyid);

        // Get leads/events for all properties in the agency
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*, property_details:property(*)")
          .in("propertyid", agencyPropertyIds)
          .not("date", "is", null);

        if (leadsError) {
          console.error("Failed to fetch calendar leads:", leadsError);
          return [];
        }

        return leads || [];
      } catch (err) {
        console.error("Error in useUserLeads for calendar:", err);
        return [];
      }
    },
    enabled: !!user,
  });

  return {
    leads,
    isLoading,
    error,
  };
};
