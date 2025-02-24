import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { useUserLeads } from "./hooks/use-user-leads";
import { useUserProperties } from "./hooks/use-user-properties";
import { useAuth } from "@/contexts/AuthContext";
import { QuickActions } from "./components/QuickActions";
import { ActivityFeed } from "./components/ActivityFeed";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { PerformanceMetrics } from "./components/PerformanceMetrics";

import { 
  ResponsiveContainer, 
  Treemap, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { SmartInsights } from './components/SmartInsights';

const calculateInsights = (properties: any[], leads: any[]) => {
  // Calculate response times
  const responseTimeHours = leads?.map(lead => {
    const createdDate = new Date(lead.created_at);
    const respondedDate = new Date(lead.first_response_at || lead.created_at);
    return (respondedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  }) || [];

  const avgResponseTime = responseTimeHours.length 
    ? responseTimeHours.reduce((a, b) => a + b, 0) / responseTimeHours.length
    : 0;

  // Calculate monthly lead trends
  const thisMonth = new Date().getMonth();
  const thisMonthLeads = leads?.filter(lead => 
    new Date(lead.created_at).getMonth() === thisMonth
  ).length || 0;

  const lastMonth = (thisMonth - 1 + 12) % 12;
  const lastMonthLeads = leads?.filter(lead => 
    new Date(lead.created_at).getMonth() === lastMonth
  ).length || 0;

  const leadGrowth = lastMonthLeads 
    ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 
    : 0;

  return {
    avgResponseTime: avgResponseTime.toFixed(1),
    leadGrowth: leadGrowth.toFixed(1),
    totalProperties: properties?.length || 0,
    activeLeads: leads?.filter(l => l.status === 'active').length || 0
  };
};

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

  const propertyTreeMapData = properties?.map(property => ({
    name: property.propertyid,
    size: 1000, // Using constant size for visualization
    value:  0 // Assuming there's a rent field
  })) || [];

  // Mock revenue data - replace with actual data from your API
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4800 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
  ];

  const insights = calculateInsights(properties || [], leads || []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Top Section - Quick Actions and Smart Insights */}
      <div className="space-y-6 mb-8">
        <QuickActions />
        <SmartInsights 
          properties={properties} 
          leads={leads} 
          metrics={insights} 
        />
      </div>

      {/* Performance Overview Section */}
      <div className="mb-8">
        <PerformanceMetrics />
      </div>

      {/* Main Grid - Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Property Portfolio */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Property Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={propertyTreeMapData}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#6366f1"
              >
                <Tooltip 
                  formatter={(value) => `$${value}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Middle Column - Revenue Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Revenue"]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid - Calendar, Schedule, Activity, and Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar and Schedule Section */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <div className="flex justify-between items-center">

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

        {/* Activity Feed and Weather Alerts */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivityFeed />
          <WeatherAlerts />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
