import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useUserProperties = (userId?: string) => {
  return useQuery({
    queryKey: ["properties", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("property")
        .select("propertyid")
        .eq("userid", userId);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId, // Run only if userId is available
  });
};
