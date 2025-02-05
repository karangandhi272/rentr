import { useQuery } from '@tanstack/react-query';
import { PropertyListing } from '@/types/property';
import { fetchPropertyImage, fetchUserProperties } from '@/api/properties';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async (): Promise<PropertyListing[]> => {
      const properties = await fetchUserProperties();
      
      const listingsWithImages = await Promise.all(
        properties.map(async (property) => {
          const imageUrl = await fetchPropertyImage(property.propertyid);
          return { ...property, image_url: imageUrl };
        })
      );

      return listingsWithImages;
    }
  });
}