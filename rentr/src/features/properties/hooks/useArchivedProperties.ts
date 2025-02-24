import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Property } from "@/types/property";

export const useArchivedProperties = () => {
  return useQuery<Property[]>({
    queryKey: ["archivedProperties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property")
        .select("*")
        .eq("archived", true);

      if (error) throw error;
      return data;
    },
  });
};