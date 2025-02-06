import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Lead = {
  id: string;
  name: string;
  date: string;
  property: string;
  created_at: string;
  property_details?: {
    name: string;
    address: string;
  };
};

const HomePage = () => {
  const [date, setDate] = React.useState(new Date());
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpiData, setKpiData] = useState({
    listingsOnMarket: 0,
    leadsGenerated: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        // Get user's properties
        const { data: properties, error: propertyError } = await supabase
          .from('property')
          .select('propertyid')
          .eq('userid', user.id);

        if (propertyError) throw propertyError;
        
        // Update KPI for listings
        setKpiData(prev => ({
          ...prev,
          listingsOnMarket: properties?.length || 0
        }));

        if (!properties?.length) return;

        const propertyIds = properties.map(p => p.propertyid);

        // Get leads with property details
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select(`
            *,
            property_details:property(
              name,
              address
            )
          `)
          .in('property', propertyIds)
          .order('date', { ascending: true });

        if (leadsError) throw leadsError;

        setLeads(leadsData || []);
        setKpiData(prev => ({
          ...prev,
          leadsGenerated: leadsData?.length 
        }));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const todaysEvents = leads
    .filter(lead => {
      const leadDate = new Date(lead.date);
      return leadDate.toDateString() === new Date().toDateString();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = todaysEvents[0];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                Next up: {nextEvent.property_details?.name} at {new Date(nextEvent.date).toLocaleTimeString()}
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
