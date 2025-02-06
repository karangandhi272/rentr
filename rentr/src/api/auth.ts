import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "@/types/user";

export async function fetchUserProfile(): Promise<UserProfile> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return {
    email: user.email || "",
    first_name: user.user_metadata.first_name || "",
    last_name: user.user_metadata.last_name || "",
    username: user.user_metadata.username || "",
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
