import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyAndImage } from "@/types/property";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PropertyCardProps {
  listing: PropertyAndImage;
  isArchived?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ listing, isArchived }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localArchived, setLocalArchived] = useState(isArchived);

  const { mutate: toggleArchive, isPending } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("property") // Note: changed from "property" to "properties"
        .update({ archived: !localArchived })
        .eq("propertyid", listing.propertyid)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      setLocalArchived(!localArchived);
      queryClient.invalidateQueries({ 
        queryKey: ["properties"]
      });
      queryClient.invalidateQueries({ 
        queryKey: ["archivedProperties"]
      });

      toast({
        title: "Success",
        description: `Property ${localArchived ? "unarchived" : "archived"} successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${localArchived ? "unarchive" : "archive"} property. Please try again.`,
      });
      console.error("Archive error:", error);
    },
  });

  // Update local state when prop changes
  useEffect(() => {
    setLocalArchived(isArchived);
  }, [isArchived]);

  return (
    <Card className="border-2 border-gray-500">
      <CardHeader>
        <CardTitle>{listing.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={listing.image_url}
          alt={listing.name || "Property Image"}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
        <div className="space-y-2">
          <p>Price: ${listing.price}/month</p>
          <p>{listing.address_string}</p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate(`/manage/${listing.propertyid}`)}
              className="w-full rounded-md border border-black hover:bg-primary/90"
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleArchive()}
              className="w-full text-muted-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {localArchived ? "Unarchive" : "Archive"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
