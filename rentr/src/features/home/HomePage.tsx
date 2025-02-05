import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Building2, UserPlus } from "lucide-react";

const HomePage = () => {
  const [date, setDate] = React.useState(new Date());

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
        <Card className="col-span-1">
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

        {/* Empty space for future content */}
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default HomePage;
