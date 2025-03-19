import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

/**
 * Get properties associated with the user's agency
 */
export const useUserProperties = (userId: string) => {
  return useQuery({
    queryKey: ["userAgencyProperties", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      try {
        // First get the user's agency ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("agencyid")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Failed to get user agency:", userError);
          return [];
        }
        
        if (!userData?.agencyid) {
          console.log("User has no agency association");
          return [];
        }

        // Then get properties for that agency
        const { data: properties, error: propError } = await supabase
          .from("property")
          .select("*")
          .eq("agencyid", userData.agencyid);

        if (propError) {
          console.error("Failed to fetch properties:", propError);
          return [];
        }

        return properties || [];
      } catch (err) {
        console.error("Error in useUserProperties:", err);
        return [];
      }
    },
    enabled: Boolean(userId),
  });
};
