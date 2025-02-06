import PropertyCard from "@/components/calendar/PropertyCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProperties } from "./hooks/useProperties";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const { data: listings, isLoading } = useProperties();

  if (isLoading) return <div>Loading...</div>;

  const filteredListings = listings?.filter((property) =>
    property.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col px-4 sm:px-8">
      <h1 className="text-2xl font-semibold text-primary-foreground mb-4">
        Properties
      </h1>
      <div className="w-full flex justify-between mb-4 mt-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Properties..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 block rounded-xl"
          />
        </div>
        <Button onClick={() => navigate("/add-property")} variant={"outline"}>
          Add Property
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 overflow-auto">
        {(filteredListings || []).map((property) => (
          <PropertyCard key={property.propertyid} listing={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertiesPage;
