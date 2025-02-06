import { supabase } from "@/lib/supabaseClient";

export const leadsKeys = {
  all: ["leads"] as const,
  property: (propertyId: string) => [...leadsKeys.all, { propertyId }] as const,
};

export const leadsApi = {
  getLeads: async () => {
    const { data: leads, error } = await supabase.from("leads").select("*");
    //   .eq("userid", user.id);

    if (error) throw error;

    return leads;
  },

  getLeadsByPropertyId: async (propertyId: string) => {
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("property", propertyId);

    if (error) throw error;

    return leads;
  },
};
