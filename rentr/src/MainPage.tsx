import React, { useEffect, useState } from 'react';
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
  CalendarTodayTrigger
} from '@/components/ui/full-calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addHours } from 'date-fns';
import { Sidebar } from './components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";




type PropertyListing = {
  id: string;
  propertyid: string;
  name: string;
  price: number;
  address: string;
  description: string;
  image_url?: string;
};

export default function MainPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<PropertyListing[]>([]);

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: properties, error: propertiesError } = await supabase
          .from('property')
          .select('*')
          .eq('userid', user.id);

        if (propertiesError) throw propertiesError;

        const listingsWithImages = await Promise.all(
          properties.map(async (property) => {

    
            const { data: images, error: imagesError } = await supabase
              .from('propertyimages')
              .select('url')
              .eq('propertyid', property.propertyid)
              .limit(1)
              .single();

            if (imagesError) {
              console.error('Error fetching image:', imagesError);
              return { ...property, image_url: '/api/placeholder/300/200' };
            }

            return { ...property, image_url: images?.url };
          })
        );

        setListings(listingsWithImages);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    }

    fetchListings();
  }, []);

  return (
    <div className="md:ml-16 transition-all duration-300">
    <Sidebar/>
    <Calendar
      events={[
        {
          id: '1',
          start: new Date(),
          end: addHours(new Date(), 2),
          title: 'event A',
          color: 'pink',
        },
        {
          id: '2',
          start: addHours(new Date(), 1.5),
          end: addHours(new Date(), 3),
          title: 'event B',
          color: 'blue',
        },
      ]}
    >
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
            <ChevronLeft size={ 20}  /> 
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

    <div className="w-full flex justify-end mb-4 mt-4 px-4 md:px-8">
      <Button 
        onClick={() => navigate('/addproperty')} 
        className="bg-primary text-black hover:bg-primary/90 px-6 py-2 rounded-md border border-black shadow-md transition-all duration-300 text-sm md:text-base font-medium"
      >
        Add Property
      </Button>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-auto">
        {listings.map((property) => (
          <Card key={property.id} className="border-2 border-black">
            <CardHeader>
              <CardTitle>{property.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={property.image_url} 
                alt={property.name} 
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <div className="space-y-2">
                <p>Price: ${property.price}/month</p>
                <p>{property.address}</p>
                <Button 
                  onClick={() => {navigate(`/manage/${property.propertyid}`)}}
                  className="w-full rounded-md border border-black hover:bg-primary/90"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}