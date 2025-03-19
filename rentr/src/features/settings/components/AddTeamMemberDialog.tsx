import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useAddAgencyUser } from "../hooks/useAgencyUsers";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/types/auth.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2 } from "lucide-react";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeamMemberDialog({ open, onOpenChange }: AddTeamMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.User);
  const [isInvited, setIsInvited] = useState(false);
  const { toast } = useToast();
  const { mutate: addUser, isPending } = useAddAgencyUser();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address.",
      });
      return;
    }
    
    addUser(
      { email, name, role },
      {
        onSuccess: (data) => {
          if (data.invited) {
            // Show the invitation success message in the dialog
            setIsInvited(true);
          } else {
            // Close the dialog and show a toast
            toast({
              title: "Team member added",
              description: `${email} has been added to your team.`,
            });
            handleReset();
            onOpenChange(false);
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error adding team member",
            description: error.message || "There was a problem adding the team member.",
          });
        },
      }
    );
  };
  
  const handleReset = () => {
    setEmail("");
    setName("");
    setRole(Role.User);
    setIsInvited(false);
  };
  
  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        {!isInvited ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your agency team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address*</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team.member@example.com"
                  autoFocus
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, we'll use the email username as their name
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Role</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as Role)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={Role.User} id="role-user" />
                    <Label htmlFor="role-user" className="font-normal">
                      User (Standard access)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={Role.Admin} id="role-admin" />
                    <Label htmlFor="role-admin" className="font-normal">
                      Admin (Full control)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Alert className="bg-blue-50 text-blue-700 border-blue-200">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle className="font-medium text-blue-800">New to Rentr?</AlertTitle>
                <AlertDescription className="text-sm text-blue-700">
                  If this user doesn't have a Rentr account, we'll create one and send them an invitation email with password setup instructions.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !email}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Member
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Invitation Sent!</h3>
              <p className="text-gray-600 mb-6">
                An invitation email has been sent to <strong>{email}</strong>. They'll be able to set up their password and access your agency.
              </p>
              <Button onClick={() => {
                handleReset(); 
                onOpenChange(false);
              }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
