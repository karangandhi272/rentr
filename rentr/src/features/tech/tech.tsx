
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Star, Wrench } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Technician {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  phone: string;
  status: "available" | "busy" | "offline";
}

const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Smith",
    specialty: "Plumbing",
    rating: 4.8,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    phone: "(555) 123-4567",
    status: "available",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    specialty: "Electrical",
    rating: 4.9,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    phone: "(555) 234-5678",
    status: "busy",
  },
  // Add more technicians as needed
];

const TechnicianPage = () => {
  const getStatusColor = (status: Technician["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Maintenance Technicians</h1>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          {mockTechnicians.length} Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTechnicians.map((tech) => (
          <Card key={tech.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={tech.image} />
                  <AvatarFallback>{tech.name[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                    tech.status
                  )}`}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{tech.name}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                  <span>{tech.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Specializes in {tech.specialty}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{tech.phone}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => window.location.href = `tel:${tech.phone}`}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                className="flex-1"
                onClick={() => console.log(`Open chat with ${tech.name}`)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TechnicianPage;