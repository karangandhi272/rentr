"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
  propertyId: string; // Add propertyId prop
}

type TimeSlot = {
  date: string;
  startTime: string;
  endTime: string;
};

export function DateTimePicker({ date, setDate, propertyId }: DateTimePickerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>();

  // Fetch property owner's availability
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setIsLoading(true);
        console.log('Fetching availability for property:', propertyId);
        
        const { data: property, error: propertyError } = await supabase
          .from('property')
          .select('userid')
          .eq('propertyid', propertyId)
          .single();

        if (propertyError) throw propertyError;
        console.log('Found property owner:', property.userid);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('availability')
          .eq('id', property.userid)
          .single();

        if (userError) throw userError;
        console.log('User availability data:', userData?.availability);

        if (userData?.availability?.processed_slots) {
          // Normalize dates to ensure consistent comparison
          const normalizedSlots = userData.availability.processed_slots.map((slot: TimeSlot) => ({
            ...slot,
            date: new Date(slot.date).toISOString().split('T')[0]
          }));
          setAvailableSlots(normalizedSlots);
          console.log('Normalized slots:', normalizedSlots);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (propertyId) {
      fetchAvailability();
    }
  }, [propertyId]);

  // Get available times for selected date
  const getAvailableTimesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    console.log('Checking times for date:', dateString);
    console.log('Available slots:', availableSlots);
    
    return availableSlots
      .filter(slot => slot.date === dateString)
      .map(slot => slot.startTime)
      .sort();
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="mr-2 h-4 w-4" />
          )}
          {date ? format(date, "PPP HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border rounded-md shadow-md">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="bg-white"
          disabled={(date) => {
            const dateString = date.toISOString().split('T')[0];
            return !availableSlots.some(slot => slot.date === dateString);
          }}
        />
        {selectedDate && (
          <div className="p-3 border-t bg-white">
            <Select value={selectedTime} onValueChange={handleTimeSelect}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {getAvailableTimesForDate(selectedDate).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}