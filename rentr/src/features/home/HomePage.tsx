import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Building2, RotateCw, UserPlus } from "lucide-react";

const HomePage = () => {
  const [date, setDate] = React.useState(new Date());

  const todaysEvents = [
    {
      id: 1,
      time: "09:00 - 10:30",
      title: "Property Viewing - 123 Oak St",
      type: "viewing",
    },
    {
      id: 2,
      time: "11:00 - 12:00",
      title: "Client Meeting - Johnson Family",
      type: "meeting",
    },
    {
      id: 3,
      time: "14:00 - 15:00",
      title: "Property Photography - 456 Pine Ave",
      type: "task",
    },
    {
      id: 4,
      time: "16:30 - 17:30",
      title: "Open House Prep - 789 Maple Dr",
      type: "task",
    },
  ];

  const nextEvent = {
    time: "09:00",
    title: "Property Viewing - 123 Oak St",
  };

  const kpiData = {
    listingsOnMarket: 12,
    leadsGenerated: 45,
  };

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
            <div className="text-2xl font-bold">{kpiData.listingsOnMarket}</div>
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
            <div className="text-2xl font-bold">{kpiData.leadsGenerated}</div>
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
              // onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Good Evening!</CardTitle>
              <p className="text-sm text-muted-foreground">
                You have {todaysEvents.length} events planned for today.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Next up: {nextEvent.title} at {nextEvent.time}
            </div>
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
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.time}
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    onClick={() =>
                      console.log("Clicked refresh for event:", event.id)
                    }
                  >
                    <RotateCw className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
