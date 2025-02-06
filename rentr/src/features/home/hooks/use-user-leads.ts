import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useUserLeads = (propertyIds: string[]) => {
  return useQuery({
    queryKey: ["leads", propertyIds],
    queryFn: async () => {
      if (!propertyIds.length) return [];

      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          id,
          name,
          date,
          property,
          created_at,
          property_details:property(
            name,
            address
          )
        `
        )
        .in("property", propertyIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: propertyIds.length > 0, // Run only if propertyIds exist
  });
};
