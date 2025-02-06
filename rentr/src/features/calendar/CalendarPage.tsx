import PropertyCalendar from "@/components/calendar/PropertyCalendar";
import { useUserLeads } from "./hooks/use-user-leads";

const CalendarPage = () => {
  const { leads, isLoading } = useUserLeads();

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
