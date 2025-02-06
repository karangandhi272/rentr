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

export type SignUpData = {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  profile_picture?: string;
  role?: string;
};
