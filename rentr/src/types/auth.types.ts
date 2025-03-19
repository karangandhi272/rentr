import { Database } from "./supabase";

export type DbUser = Database["public"]["Tables"]["users"]["Row"];
export type DbProfile = Pick<
  DbUser,
  "name" | "phone_number" | "profile_picture" | "role"
>;

export interface AuthUser extends DbProfile {
  id: string;
  email: string;
}

export enum Role {
  Admin = "Admin",
  User = "User"
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: Role;
  agencyId?: string;
  phoneNumber?: string;
}

export interface Agency {
  id: string;
  name: string;
  description?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface AgencyMember {
  id: string;
  userid: string;
  agencyid: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  agencyid?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
