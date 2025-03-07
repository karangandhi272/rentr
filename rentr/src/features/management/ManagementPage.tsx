import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  FileText,
  MapPin,
  DollarSign,
  Copy,
  Check,
  ClipboardCheck,
  Settings, // Add this import
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/types/property";
import { propertiesApi } from "@/api/properties";
import { Lead } from "@/types/leads";
import { leadsApi, leadsKeys } from "@/api/lead";

export const listingsApi = {
  postListing: async (property: Property) => {
    const listingData = {
      title: property.name,
      description: property.description,
      price: property.price,
      location: property.postal,
      images: [], // TODO: Add property images
    };

    const response = await fetch("http://localhost:3000/api/listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error("Failed to post listing");
    }

    return response.json();
  },
};

const RentersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = React.useState(false);
  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryFn: () => propertiesApi.fetchPropertyById(id!),
    queryKey: ["property", id],
  });
  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryFn: () => leadsApi.getLeadsByPropertyId(id!),
    queryKey: leadsKeys.property(id!),
  });
  const [posting, setPosting] = React.useState<boolean>(false);

  const handleAddRenter = () => {
    if (!property) return;
    setIsCopied(true);
    const inviteLink = `/renterform/${id}`;
    const isMobile = window.innerWidth <= 768;
    navigator.clipboard.writeText(`${window.location.origin}${inviteLink}`);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
      duration: 2000,
      className: isMobile
        ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]"
        : "",
    });
  };

  const handlePostListing = async () => {
    try {
      if (!property) {
        throw new Error("Property not found");
      }
      if (posting) {
        return;
      }
      setPosting(true);
      await listingsApi.postListing(property);
      toast({
        title: "Success!",
        description: "Property listing has been posted",
        duration: 3000,
        className:
          window.innerWidth <= 768
            ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]"
            : "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post listing",
        variant: "destructive",
        duration: 3000,
      });
    }
    setPosting(false);
  };

  const handleChatClick = (leadId: string) => {
    navigate(`/chat/${leadId}`);
  };

  const handlePrecheck = async (lead: Lead) => {
    try {
      await leadsApi.sendPrecheckEmail(lead.id.toString(), lead.email);
      toast({
        title: "Success!",
        description: "Precheck email has been sent",
        duration: 3000,
        className: window.innerWidth <= 768
          ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]"
          : "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send precheck email",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (propertyLoading || leadsLoading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>No property found</div>;
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-4 md:space-y-6">
      <Card className="w-full max-w-5xl mx-auto bg-gray-800 text-white">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <MapPin className="size-6 md:size-8 text-blue-400" />
            <div>
              <CardTitle className="text-lg md:text-2xl font-bold break-words">
                {property.address_string}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <DollarSign className="size-4 md:size-5 text-green-400" />
                <p className="text-base md:text-lg text-gray-300">
                  ${property.price}/month
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 transition-all duration-200"
              onClick={handlePostListing}
              disabled={posting}
            >
              Post Listing
            </Button>
            <Button
              variant="secondary"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              onClick={handleAddRenter}
            >
              {isCopied ? (
                <Check className="h-4 w-4 transition-all duration-200" />
              ) : (
                <Copy className="h-4 w-4 transition-all duration-200" />
              )}{" "}
              Copy Link
            </Button>
            <Button
              variant="outline"
              className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 transition-all duration-200"
              onClick={() => navigate(`/properties/${id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </div>
        </CardHeader>
      </Card>
      {leads!.length === 0 ? (
        <Card className="w-full max-w-5xl mx-auto">
          <CardContent className="p-6 text-center text-muted-foreground">
            No applications received yet
          </CardContent>
        </Card>
      ) : (
        leads!.map((lead) => (
          <Card key={lead.id} className="w-full max-w-5xl mx-auto">
            <CardContent className="flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 space-y-4 md:space-y-0">
              <div className="flex-grow space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base md:text-lg font-semibold">
                    {lead.name}
                  </h3>
                  <Badge variant="secondary">New Lead</Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {lead.number}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Preferred Date:{" "}
                  {new Date(lead.date as string).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Applied: {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex w-full md:w-auto space-x-2 md:space-x-4">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => handleChatClick(lead.id.toString())}
                >
                  <MessageCircle className="mr-2 size-4" /> Chat
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => handlePrecheck(lead)}
                >
                  <ClipboardCheck className="mr-2 size-4" /> Precheck
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Toaster />
    </div>
  );
};

export default RentersPage;
