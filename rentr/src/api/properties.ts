import { supabase } from "@/lib/supabaseClient";
import { Property } from "@/renterform";

export async function fetchUserProperties() {
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
}

export async function fetchPropertyImage(propertyid: string) {
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
}

export async function fetchPropertyImages(propertyid: string) {
  const { data: images, error: imagesError } = await supabase
    .from("propertyimages")
    .select("url")
    .eq("propertyid", propertyid);

  if (imagesError) {
    console.error("Error fetching image:", imagesError);
    return "/api/placeholder/300/200";
  }

  return images;
}

export async function fetchPropertyById(propertyId: string): Promise<Property> {
  const { data: property, error: propertyError } = await supabase
    .from("property")
    .select("*")
    .eq("propertyid", propertyId)
    .single();

  if (propertyError) throw propertyError;

  return property;
}

// export async function submitRentalApplication(
//   application: Omit<RentalApplication, "status">
// ): Promise<void> {
//   const { error } = await supabase
//     .from("rental_applications")
//     .insert([{ ...application, status: "pending" }]);

//   if (error) throw error;
// }
