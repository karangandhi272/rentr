import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { useUserLeads } from "./hooks/use-user-leads";
import { useUserProperties } from "./hooks/use-user-properties";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const [date, setDate] = React.useState(new Date());
  const { user } = useAuth();

  const { data: properties, isLoading: propertiesLoading } = useUserProperties(
    user!.id
  );
  const propertyIds = properties?.map((p) => p.propertyid) ?? [];

  const { data: leads, isLoading: leadsLoading } = useUserLeads(propertyIds);

  if (propertiesLoading || leadsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todaysEvents = (leads || [])
    .filter((lead) => {
      try {
        const leadDate = new Date(lead.date);
        const today = new Date();
        return (
          leadDate.getDate() === today.getDate() &&
          leadDate.getMonth() === today.getMonth() &&
          leadDate.getFullYear() === today.getFullYear()
        );
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = todaysEvents.length > 0 ? todaysEvents[0] : null;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Listings on Market
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Generated
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="col-span-1 md:col-span-1 order-2 md:order-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 order-1 md:order-2">
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle>Today's Schedule</CardTitle>
              <span className="text-sm text-muted-foreground">
                {todaysEvents.length} viewings
              </span>
            </div>
            {nextEvent && (
              <div className="text-sm bg-muted/50 p-2 rounded-md">
                <span className="font-medium">Next:</span>{" "}
                <span className="text-muted-foreground">
                  {nextEvent.property_details?.[0]?.name} at{" "}
                  {new Date(nextEvent.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {event.name}
                      </p>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(event.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.property_details?.[0]?.name}
                    </p>
                  </div>
                </div>
              ))}
              {todaysEvents.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No viewings scheduled for today
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
