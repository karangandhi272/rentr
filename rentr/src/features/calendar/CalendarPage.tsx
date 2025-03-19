import React from "react";
import PropertyCalendar from "@/components/calendar/PropertyCalendar";
import { useUserLeads } from "./hooks/use-user-leads";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const CalendarPage = () => {
  const { leads, isLoading, error } = useUserLeads();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Error Loading Calendar</h2>
          <p className="text-gray-500 mb-6">
            We encountered a problem loading your calendar. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PropertyCalendar
        events={(leads || []).map((lead) => {
          return {
            id: lead.id,
            title: lead.name,
            start: new Date(lead.date),
            end: new Date(lead.date),
            allDay: true,
            extendedProps: {
              leadId: lead.id,
              property: lead.property,
              propertyDetails: lead.property_details,
            },
          };
        })}
        isLoading={isLoading}
      />
    </>
  );
};

export default CalendarPage;
