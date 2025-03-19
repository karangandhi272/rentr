import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// Add enum for roles
export enum Role {
  Admin = "Admin",
  User = "User"
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: Role; // Change string to Role enum
  agencyId?: string; // Add this for linking users to agencies
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signUp({ email, password, name, role, agencyId, phoneNumber }: SignUpData) {
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          agencyid: agencyId,
          phone_number: phoneNumber,
        },
      }
    });

    if (signUpError) throw signUpError;

    if (user) {
      // Add user to the users table, but without email and password
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: user.id,
          name,
          role, // This is now Role.Admin or Role.User
          agencyid: agencyId,
          phone_number: phoneNumber,
          created_at: new Date().toISOString(),
          is_active: true,
        },
      ]);

      if (profileError) throw profileError;

      // If agency ID is provided, also add entry to agency_members table
      if (agencyId) {
        const { error: memberError } = await supabase.from("agency_members").insert([
          {
            userid: user.id,
            agencyid: agencyId,
            role, // This is now Role.Admin or Role.User
            created_at: new Date().toISOString(),
            is_active: true,
          },
        ]);

        if (memberError) throw memberError;
      }
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
