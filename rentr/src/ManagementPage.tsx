import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, PlusCircle, MapPin, DollarSign, Copy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Sidebar } from './components/ui/sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

type Renter = {
  id: string;
  name: string;
  score: number;
  email: string;
  phone: string;
};

type Property = {
  propertyid: string;
  name: string;
  address: string;
  price: number;
};

const RentersPage: React.FC = () => {
  const { id} = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [renters, setRenters] = useState<Renter[]>([
    { id: '1', name: "Emma Johnson", score: 95, email: "emma@example.com", phone: "555-1234" },
    { id: '2', name: "Michael Chen", score: 88, email: "michael@example.com", phone: "555-5678" },
    { id: '3', name: "Sarah Rodriguez", score: 82, email: "sarah@example.com", phone: "555-9012" },
  ].sort((a, b) => b.score - a.score));
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProperty() {
      try {
        console.log(id);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('property')
          .select('*')
          .eq('propertyid', id)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property details",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  const handleAddRenter = () => {
    if (!property) return;
    
    const inviteLink = `/renterform/${id}`;
    const isMobile = window.innerWidth <= 768;
    
    toast({
      title: "Invitation Link Generated",
      description: inviteLink,
      action: (
        <ToastAction 
          altText="Copy link" 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}${inviteLink}`);
            toast({
              title: "Copied!",
              description: "Link copied to clipboard",
              duration: 2000,
              className: isMobile ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]" : "",
            });
          }}
        >
          <Copy className="h-4 w-4" />
        </ToastAction>
      ),
      duration: 10000,
      className: isMobile ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]" : "",
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>No property found</div>;
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-4 md:space-y-6">
      <Sidebar />
      <Card className="w-full max-w-5xl mx-auto bg-gray-800 text-white">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <MapPin className="size-6 md:size-8 text-blue-400" />
            <div>
              <CardTitle className="text-lg md:text-2xl font-bold break-words">{property.address}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <DollarSign className="size-4 md:size-5 text-green-400" />
                <p className="text-base md:text-lg text-gray-300">${property.price}/month</p>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            onClick={handleAddRenter}
          >
            <PlusCircle className="mr-2 size-4" /> Add Renter
          </Button>
        </CardHeader>
      </Card>
      {renters.map((renter) => (
        <Card key={renter.id} className="w-full max-w-5xl mx-auto">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 space-y-4 md:space-y-0">
            <div className="flex-grow space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base md:text-lg font-semibold">{renter.name}</h3>
                <Badge variant="secondary">{renter.score} Score</Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">{renter.email}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{renter.phone}</p>
            </div>
            <div className="flex w-full md:w-auto space-x-2 md:space-x-4">
              <Button variant="outline" onClick={() => navigate("/chat")} className="flex-1 md:flex-none">
                <MessageCircle className="mr-2 size-4" /> Chat
              </Button>
              <Button className="flex-1 md:flex-none">
                <FileText className="mr-2 size-4" /> Send Form
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Toaster />
    </div>
  );
};

export default RentersPage;