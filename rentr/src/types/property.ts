import { Database } from "./supabase";

export type Property = Database["public"]["Tables"]["property"]["Row"];
export type PropertyAndImage = Property & { image_url: string };

export type PropertyUpdate = Database["public"]["Tables"]["property"]["Update"];
export type PropertyInsert = Database["public"]["Tables"]["property"]["Insert"];
