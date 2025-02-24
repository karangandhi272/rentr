import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Settings } from "lucide-react"; // Add this import
import { useNavigate } from "react-router-dom"; // Add this import

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

// Add utility functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

// Add priority map based on input
const getDayPriority = (date: string) => {
  const day = new Date(date).getDay();
  // Priority order based on input text analysis
  // Lower number = higher priority
  const priorities: { [key: number]: number } = {
    0: 6, // Sunday
    1: 0, // Monday
    2: 1, // Tuesday
    3: 2, // Wednesday
    4: 3, // Thursday
    5: 4, // Friday
    6: 5, // Saturday
  };
  return priorities[day];
};

const sortTimeSlots = (a: TimeSlot, b: TimeSlot) => {
  const dayPriorityA = getDayPriority(a.date);
  const dayPriorityB = getDayPriority(b.date);

  if (dayPriorityA !== dayPriorityB) {
    return dayPriorityA - dayPriorityB;
  }
  return a.startTime.localeCompare(b.startTime);
};

export default function AvailibilityPage() {
  const { toast } = useToast();
  const [availability, setAvailability] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Add this hook

  const saveAvailability = async () => {
    if (!availability.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter availability text",
      });
      return;
    }

    try {
      setLoading(true);

      // First get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      // Process availability through your API
      const response = await fetch("http://localhost:3000/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (!data.success) throw new Error(data.error || "Failed to process availability");

      // Save processed slots to Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          availability: {
            raw_text: availability,
            processed_slots: data.data.slots,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSlots(data.data.slots);
      toast({
        title: "Success",
        description: "Availability saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save availability",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load saved availability on component mount
  useEffect(() => {
    async function loadAvailability() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select('availability')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.availability) {
          setAvailability(data.availability.raw_text || '');
          setSlots(data.availability.processed_slots || []);
        }
      } catch (error) {
        console.error('Error loading availability:', error);
      }
    }

    loadAvailability();
  }, []);

  return (
    <div className="md:ml-16 p-4 md:p-8">
      {/* Add mobile settings button */}
      <button 
        onClick={() => navigate('/settings')}
        className="md:hidden fixed top-4 right-4 p-2 rounded-full hover:bg-gray-100"
      >
        <Settings className="h-6 w-6 text-gray-600" />
      </button>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Set Your Availability</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your availability
              </label>
              <Textarea
                placeholder="Example:
Every Monday and Wednesday: 9 AM - 5 PM
Tuesdays: Not Available
Fridays: 10 AM - 3 PM"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter your availability in any format that's clear for renters
                to understand.
              </p>
            </div>

            <Button
              onClick={saveAvailability}
              className="w-full border-2 border-black mt-4"
              disabled={loading}
            >
              {loading ? "Processing..." : "Save Availability"}
            </Button>

            {slots.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  Available Time Slots
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    slots.reduce((acc: Record<string, TimeSlot[]>, slot) => {
                      if (!acc[slot.date]) {
                        acc[slot.date] = [];
                      }
                      acc[slot.date].push(slot);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, daySlots]: [string, TimeSlot[]]) => (
                      <div key={date} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{date}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {daySlots
                            .sort((a, b) =>
                              a.startTime.localeCompare(b.startTime)
                            )
                            .map((slot, index) => (
                              <div
                                key={`${date}-${index}`}
                                className="text-sm text-gray-600"
                              >
                                {slot.startTime} - {slot.endTime}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
