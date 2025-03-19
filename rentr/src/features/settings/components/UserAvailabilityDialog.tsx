import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgencyUser } from "../types";
import { UserAvailabilitySchedule } from "./UserAvailabilitySchedule";

interface UserAvailabilityDialogProps {
  user: AgencyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAvailabilityDialog({ 
  user,
  open,
  onOpenChange
}: UserAvailabilityDialogProps) {
  if (!user) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {user.name}'s Availability
          </DialogTitle>
          <DialogDescription>
            View team member's working hours and availability
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <UserAvailabilitySchedule
            userId={user.id}
            initialAvailability={user.availability || {}}
            readOnly
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
