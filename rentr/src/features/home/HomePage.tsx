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
    <div className="p-8 space-y-6">
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
      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-2 md:col-span-1">
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

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">
                You have {todaysEvents.length} viewings planned for today.
              </p>
            </div>
            {nextEvent && (
              <div className="text-sm text-muted-foreground">
                Next up: {nextEvent.property_details?.name} at{" "}
                {new Date(nextEvent.date).toLocaleTimeString()}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {event.property_details?.name} - {event.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.property_details?.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {todaysEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No viewings scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
