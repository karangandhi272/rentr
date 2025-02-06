import { useQuery } from "@tanstack/react-query";
import { PropertyAndImage } from "@/types/property";
import { propertiesApi } from "@/api/properties";

export function useProperties() {
  return useQuery({
    queryKey: ["properties_and_images"],
    queryFn: async (): Promise<PropertyAndImage[]> => {
      const properties = await propertiesApi.fetchUserProperties();

      const listingsWithImages = await Promise.all(
        properties.map(async (property) => {
          const imageUrl = await propertiesApi.fetchPropertyImage(
            property.propertyid
          );
          return { ...property, image_url: imageUrl };
        })
      );

      return listingsWithImages;
    },
  });
}
