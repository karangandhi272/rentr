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
  CalendarEvent,
} from "@/components/ui/full-calendar";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PropertyCalendarProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

const PropertyCalendar: React.FC<PropertyCalendarProps> = ({
  events,
  isLoading,
}) => {
  if (isLoading) {
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
    <Calendar events={events} defaultDate={events[0]?.start || new Date()}>
      <div className="h-dvh pt-14 px-4 md:px-14 flex flex-col">
        <div className="flex px-6 items-center gap-2 mb-6">
          <CalendarViewTrigger
            className="aria-[current=true]:bg-accent"
            view="day"
          >
            Day
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="week"
            className="aria-[current=true]:bg-accent"
          >
            Week
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="month"
            className="aria-[current=true]:bg-accent"
          >
            Month
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="year"
            className="aria-[current=true]:bg-accent"
          >
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
