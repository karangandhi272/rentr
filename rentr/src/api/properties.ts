import { supabase } from "@/lib/supabaseClient";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters: string) => [...propertyKeys.lists(), { filters }] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

export const propertiesApi = {
  fetchUserProperties: async function () {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: properties, error: propertiesError } = await supabase
      .from("property")
      .select("*")
      .eq("userid", user.id);

    if (propertiesError) throw propertiesError;

    return properties;
  },

  fetchPropertyImage: async function (propertyid: string) {
    const { data: images, error: imagesError } = await supabase
      .from("propertyimages")
      .select("url")
      .eq("propertyid", propertyid)
      .limit(1)
      .single();

    if (imagesError) {
      console.error("Error fetching image:", imagesError);
      return "/api/placeholder/300/200";
    }

    return images?.url;
  },
  fetchPropertyImages: async function (propertyId: string) {
    const { data: images, error: imagesError } = await supabase
      .from("propertyimages")
      .select("url")
      .eq("propertyid", propertyId)
      .limit(1)
      .single();

    if (imagesError) {
      console.error("Error fetching image:", imagesError);
      return "/api/placeholder/300/200";
    }

    return images?.url;
  },

  fetchPropertyById: async function (propertyId: string) {
    const { data: property, error: propertyError } = await supabase
      .from("property")
      .select("*")
      .eq("propertyid", propertyId)
      .single();

    if (propertyError) throw propertyError;

    return property;
  },
};
