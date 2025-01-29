import { supabase } from "@/lib/supabaseClient";
import { PropertyListing } from "@/types/property";

export async function fetchUserProperties() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: properties, error: propertiesError } = await supabase
    .from('property')
    .select('*')
    .eq('userid', user.id);

  if (propertiesError) throw propertiesError;

  return properties;
}

export async function fetchPropertyImage(propertyid: string) {
  const { data: images, error: imagesError } = await supabase
    .from('propertyimages')
    .select('url')
    .eq('propertyid', propertyid)
    .limit(1)
    .single();

  if (imagesError) {
    console.error('Error fetching image:', imagesError);
    return '/api/placeholder/300/200';
  }

  return images?.url;
}