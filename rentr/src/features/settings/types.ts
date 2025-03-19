import { Role } from "@/types/auth.types";

// Agency user interface
export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile_picture?: string | null;
  is_active: boolean;
  availability?: Availability;
}

// Agency interface
export interface Agency {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  address?: AgencyAddress;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

// Agency address interface
export interface AgencyAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// Availability for a specific day
export interface DayAvailability {
  isAvailable: boolean;
  start: string; // format: "HH:MM" 24h
  end: string;   // format: "HH:MM" 24h
}

// Availability schedule by day
export interface Availability {
  [key: string]: DayAvailability;  // monday, tuesday, etc.
}

// User notification preferences
export interface NotificationPreferences {
  email_new_leads: boolean;
  email_application_updates: boolean;
  email_team_changes: boolean;
  sms_new_leads: boolean;
  sms_application_updates: boolean;
  browser_notifications: boolean;
}
