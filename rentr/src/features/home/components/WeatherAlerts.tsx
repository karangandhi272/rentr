import { Cloud, Umbrella, Snowflake } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const WeatherAlerts = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Weather Alerts</h3>
      <Alert>
        <Cloud className="h-4 w-4" />
        <AlertTitle>Heavy Rain Expected</AlertTitle>
        <AlertDescription>
          Schedule gutter cleaning for properties in affected areas.
        </AlertDescription>
      </Alert>
    </div>
  );
};