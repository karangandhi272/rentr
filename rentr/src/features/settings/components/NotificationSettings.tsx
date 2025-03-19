import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bell, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserNotificationPreferences, useUpdateNotificationPreferences } from "../hooks/useUserNotifications";
import { NotificationPreferences } from "../types";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationSettingsProps {
  email: string;
}

const NotificationSettings = ({ email }: NotificationSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: preferences, isLoading } = useUserNotificationPreferences(user?.id);
  const { mutate: updatePreferences, isPending } = useUpdateNotificationPreferences();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [settings, setSettings] = useState<NotificationPreferences>({
    email_new_leads: true,
    email_application_updates: true,
    email_team_changes: true,
    sms_new_leads: false,
    sms_application_updates: false,
    browser_notifications: true,
  });
  
  // Update state when preferences data loads
  useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    }
  }, [preferences]);
  
  const handleToggle = (key: keyof NotificationPreferences) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  const handleSave = () => {
    if (!user?.id) return;
    
    updatePreferences(
      { userId: user.id, preferences: settings },
      {
        onSuccess: () => {
          toast({
            title: "Notification settings saved",
            description: "Your notification preferences have been updated.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to save preferences",
            description: error.message || "An error occurred while saving your preferences.",
          });
        },
      }
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4" />
            <h3 className="font-medium">Email Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-display" className="text-sm font-normal">
                Email address
              </Label>
              <div className="w-[300px]">
                <Input 
                  id="email-display" 
                  value={email} 
                  disabled 
                  className="bg-muted h-9" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_new_leads" className="text-sm font-normal">
                  New leads and inquiries
                </Label>
                <p className="text-xs text-muted-foreground">
                  Be notified when a new lead or inquiry is received
                </p>
              </div>
              <Switch
                id="email_new_leads"
                checked={settings.email_new_leads}
                onCheckedChange={() => handleToggle('email_new_leads')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_application_updates" className="text-sm font-normal">
                  Application status updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive updates when application statuses change
                </p>
              </div>
              <Switch
                id="email_application_updates"
                checked={settings.email_application_updates}
                onCheckedChange={() => handleToggle('email_application_updates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_team_changes" className="text-sm font-normal">
                  Team changes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Be notified when team members are added or removed
                </p>
              </div>
              <Switch
                id="email_team_changes"
                checked={settings.email_team_changes}
                onCheckedChange={() => handleToggle('email_team_changes')}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-4 w-4" />
            <h3 className="font-medium">SMS Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone-input" className="text-sm font-normal">
                Phone number
              </Label>
              <div className="w-[300px]">
                <Input 
                  id="phone-input" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="+1 (555) 123-4567"
                  className="h-9" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_new_leads" className="text-sm font-normal">
                  New leads and inquiries
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive SMS when a new lead or inquiry is received
                </p>
              </div>
              <Switch
                id="sms_new_leads"
                checked={settings.sms_new_leads}
                onCheckedChange={() => handleToggle('sms_new_leads')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_application_updates" className="text-sm font-normal">
                  Application status updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive SMS when application statuses change
                </p>
              </div>
              <Switch
                id="sms_application_updates"
                checked={settings.sms_application_updates}
                onCheckedChange={() => handleToggle('sms_application_updates')}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="browser_notifications" className="text-sm font-normal">
              Browser notifications
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable notifications in your browser when you're using the application
            </p>
          </div>
          <Switch
            id="browser_notifications"
            checked={settings.browser_notifications}
            onCheckedChange={() => handleToggle('browser_notifications')}
          />
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
