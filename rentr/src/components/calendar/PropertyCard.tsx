import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyListing } from '@/types/property';

type PropertyCardProps = {
  listing: PropertyListing;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle>{listing.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img 
          src={listing.image_url} 
          alt={listing.name} 
          className="w-full h-48 object-cover rounded-md mb-2"
        />
        <div className="space-y-2">
          <p>Price: ${listing.price}/month</p>
          <p>{listing.address}</p>
          <Button 
            onClick={() => navigate(`/manage/${listing.propertyid}`)}
            className="w-full rounded-md border border-black hover:bg-primary/90"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;