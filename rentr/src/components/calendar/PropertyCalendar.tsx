import { 
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarWeekView,
  CalendarMonthView,
  CalendarYearView,
  CalendarViewTrigger,
  CalendarPrevTrigger,
  CalendarNextTrigger,
  CalendarTodayTrigger,
  CalendarEvent
} from '@/components/ui/full-calendar';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { addHours, addMinutes } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Lead = {
  id: string;
  name: string;
  date: string;
  property: string;
  property_details?: {
    name: string;
    address: string;
  };
};

const PropertyCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0); // Add key for forcing re-render

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        console.log('User found:', user.id); // Debug log

        // Get properties
        const { data: properties, error: propertyError } = await supabase
          .from('property')
          .select('propertyid');

        if (propertyError) throw propertyError;
        if (!properties?.length) {
          console.log('No properties found'); // Debug log
          return;
        }

        const propertyIds = properties.map(p => p.propertyid);
        console.log('Property IDs:', propertyIds); // Debug log

        // Get leads with simplified query
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select(`
            id,
            name,
            date,
            property,
            property_details:property!inner(
              name
            )
          `)
          .in('property', propertyIds);

        if (leadsError) {
          console.error('Leads Error:', leadsError); // Debug log
          throw leadsError;
        }

        console.log('Leads found:', leads); // Debug log

        // Transform leads to events
        const calendarEvents = (leads || []).map(lead => ({
          id: lead.id,
          start: new Date(lead.date),
          end: addMinutes(new Date(lead.date), 30),
          title: `${lead.property_details?.[0]?.name || 'Property'} - ${lead.name}`,
          color: 'blue' as const,
        }));

        console.log('Calendar Events:', calendarEvents); // Debug log

        setEvents(calendarEvents);
        setKey(prev => prev + 1); // Force calendar re-render
      } catch (error) {
        console.error('Error in fetchLeads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <Calendar 
      key={key} 
      events={events}
      defaultDate={events[0]?.start || new Date()}
    >
      <div className="h-dvh pt-14 px-4 md:px-14 flex flex-col">
        <div className="flex px-6 items-center gap-2 mb-6">
          <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
            Day
          </CalendarViewTrigger>
          <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
            Week
          </CalendarViewTrigger>
          <CalendarViewTrigger view="month" className="aria-[current=true]:bg-accent">
            Month
          </CalendarViewTrigger>
          <CalendarViewTrigger view="year" className="aria-[current=true]:bg-accent">
            Year
          </CalendarViewTrigger>

          <span className="flex-1" />

          <CalendarCurrentDate />

          <CalendarPrevTrigger>
            <ChevronLeft size={20} />
            <span className="sr-only">Previous</span>
          </CalendarPrevTrigger>

          <CalendarTodayTrigger>Today</CalendarTodayTrigger>

          <CalendarNextTrigger>
            <ChevronRight size={20} />
            <span className="sr-only">Next</span>
          </CalendarNextTrigger>
        </div>

        <div className="flex-1 px-6 overflow-hidden">
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
      </div>
    </Calendar>
  );
};

export default PropertyCalendar;