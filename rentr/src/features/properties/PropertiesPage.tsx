import PropertyCard from "@/components/calendar/PropertyCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProperties } from "./hooks/useProperties";

const PropertiesPage = () => {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useProperties();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="w-full flex justify-end mb-4 mt-4 px-4 md:px-8">
        <Button
          onClick={() => navigate("/add-property")}
          className="bg-primary text-black hover:bg-primary/90 px-6 py-2 rounded-md border border-black shadow-md transition-all duration-300 text-sm md:text-base font-medium"
        >
          Add Property
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-auto">
        {(listings || []).map((property) => (
          <PropertyCard key={property.id} listing={property} />
        ))}
      </div>
    </>
  );
};

export default PropertiesPage;
