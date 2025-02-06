import { Database } from "./supabase";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
