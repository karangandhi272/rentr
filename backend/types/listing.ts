export interface ListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  bedrooms: string;
  bathrooms: string;
  furnished: boolean;
  petFriendly: boolean;
  parkingSpots: string;
  moveInDate: string;
  propertyType: string;
  utilities: {
    hydro: boolean;
    water: boolean;
    internet: boolean;
    heat: boolean;
  };
  airConditioning?: boolean;
  agreementType: "month-to-month" | "one-year";
  smokingPermitted?: "yes" | "no" | "outdoors";
  petPolicy?: "yes" | "no" | "limited";
}

export interface PostingResult {
  success: boolean;
  platform: string;
  error?: string;
  formState?: any;
}
