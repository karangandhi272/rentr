import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserAvailability } from "../hooks/useUserAvailability";
import { Availability, DayAvailability } from "../types";

interface UserAvailabilityScheduleProps {
  userId?: string;
  initialAvailability?: Availability;
  readOnly?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

// Generate time options for select dropdowns
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      options.push(`${h}:${m}`);
    }
  }
  return options;
};

const defaultDayAvailability: DayAvailability = {
  isAvailable: false,
  start: "09:00",
  end: "17:00"
};

export function UserAvailabilitySchedule({ 
  userId, 
  initialAvailability = {}, 
  readOnly = false 
}: UserAvailabilityScheduleProps) {
  const [availability, setAvailability] = useState<Availability>(
    Object.fromEntries(
      DAYS.map(day => [
        day.key, 
        initialAvailability[day.key] || { ...defaultDayAvailability }
      ])
    )
  );
  
  const { toast } = useToast();
  const { mutate: updateAvailability, isPending } = useUpdateUserAvailability();
  
  const timeOptions = generateTimeOptions();
  
  // Update if initialAvailability changes
  useEffect(() => {
    if (initialAvailability && Object.keys(initialAvailability).length > 0) {
      setAvailability(
        Object.fromEntries(
          DAYS.map(day => [
            day.key, 
            initialAvailability[day.key] || { ...defaultDayAvailability }
          ])
        )
      );
    }
  }, [initialAvailability]);
  
  const handleToggleDay = (day: string, isAvailable: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], isAvailable }
    }));
  };
  
  const handleTimeChange = (day: string, timeType: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [timeType]: value }
    }));
  };
  
  const handleSave = () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is required to save availability",
      });
      return;
    }
    
    updateAvailability(
      { userId, availability },
      {
        onSuccess: () => {
          toast({
            title: "Availability updated",
            description: "Your availability settings have been saved.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to save",
            description: error.message || "There was a problem updating your availability.",
          });
        }
      }
    );
  };
  
  // Format time for display (24h to 12h)
  const formatTimeForDisplay = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="border rounded-md overflow-hidden">
        {DAYS.map((day, index) => (
          <div 
            key={day.key} 
            className={`flex items-center justify-between p-4 ${
              index < DAYS.length - 1 ? 'border-b' : ''
            } ${availability[day.key]?.isAvailable ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="flex items-center space-x-3">
              <Switch
                id={`${day.key}-toggle`}
                checked={availability[day.key]?.isAvailable || false}
                onCheckedChange={(checked) => handleToggleDay(day.key, checked)}
                disabled={readOnly}
              />
              <Label
                htmlFor={`${day.key}-toggle`}
                className={`font-medium ${
                  availability[day.key]?.isAvailable ? '' : 'text-muted-foreground'
                }`}
              >
                {day.label}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Select
                value={availability[day.key]?.start}
                onValueChange={(value) => handleTimeChange(day.key, 'start', value)}
                disabled={readOnly || !availability[day.key]?.isAvailable}
              >
                <SelectTrigger className="w-[105px] h-9">
                  <SelectValue>
                    {formatTimeForDisplay(availability[day.key]?.start || "09:00")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={`${day.key}-start-${time}`} value={time}>
                      {formatTimeForDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-muted-foreground">to</span>
              
              <Select
                value={availability[day.key]?.end}
                onValueChange={(value) => handleTimeChange(day.key, 'end', value)}
                disabled={readOnly || !availability[day.key]?.isAvailable}
              >
                <SelectTrigger className="w-[105px] h-9">
                  <SelectValue>
                    {formatTimeForDisplay(availability[day.key]?.end || "17:00")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={`${day.key}-end-${time}`} value={time}>
                      {formatTimeForDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setAvailability(
              Object.fromEntries(
                DAYS.map(day => [
                  day.key, 
                  { ...defaultDayAvailability }
                ])
              )
            )}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
