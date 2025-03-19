import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building, Upload, MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAgencyDetails, useUpdateAgency } from "../hooks/useAgency";
import { useToast } from "@/hooks/use-toast";
import { Agency, AgencyAddress } from "../types";

interface AgencySettingsProps {
  agencyId?: string;
}

const AgencySettings = ({ agencyId }: AgencySettingsProps) => {
  const { toast } = useToast();
  const { data: agency, isLoading, isError } = useAgencyDetails(agencyId);
  const { mutate: updateAgency, isPending } = useUpdateAgency();
  
  const [formData, setFormData] = useState<{
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    address: AgencyAddress;
  }>({
    name: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
  });
  
  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        description: agency.description || "",
        email: agency.email || "",
        phone: agency.phone || "",
        website: agency.website || "",
        address: agency.address || {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
        },
      });
    }
  }, [agency]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agencyId) {
      toast({
        variant: "destructive",
        title: "Agency not found",
        description: "No agency ID provided.",
      });
      return;
    }
    
    updateAgency(
      { id: agencyId, ...formData },
      {
        onSuccess: () => {
          toast({
            title: "Agency updated",
            description: "Agency details have been successfully updated.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: error.message || "Failed to update agency details.",
          });
        },
      }
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isError || !agencyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agency not found</CardTitle>
          <CardDescription>
            Unable to load agency details. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Agency Settings</CardTitle>
        <CardDescription>
          Update your agency profile and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                {agency?.logo_url ? (
                  <img
                    src={agency.logo_url}
                    alt={agency.name}
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <Building className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <Button variant="outline" size="sm" type="button" className="flex gap-2">
                <Upload className="h-4 w-4" /> Upload logo
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Agency Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-20"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" />
              <h3 className="font-medium">Address Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.address.postal_code}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgencySettings;
