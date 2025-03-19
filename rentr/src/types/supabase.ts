export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo: string | null
          name: string
          phone: string | null
          postal: string | null
          province: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name: string
          phone?: string | null
          postal?: string | null
          province?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name?: string
          phone?: string | null
          postal?: string | null
          province?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      availibility: {
        Row: {
          created_at: string
          id: number
          month: string | null
          times: Json | null
          year: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          month?: string | null
          times?: Json | null
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          month?: string | null
          times?: Json | null
          year?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          date: Json | null
          email: string | null
          id: string
          name: string | null
          number: number | null
          property: string | null
          property_answers: Json | null
        }
        Insert: {
          created_at?: string
          date?: Json | null
          email?: string | null
          id?: string
          name?: string | null
          number?: number | null
          property?: string | null
          property_answers?: Json | null
        }
        Update: {
          created_at?: string
          date?: Json | null
          email?: string | null
          id?: string
          name?: string | null
          number?: number | null
          property?: string | null
          property_answers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "Leads_property_fkey"
            columns: ["property"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["propertyid"]
          },
        ]
      }
      property: {
        Row: {
          address: string | null
          address_string: string | null
          agencyid: string | null
          apt: string | null
          archived: boolean | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          name: string | null
          postal: string | null
          price: number | null
          propertyid: string
          province: string | null
        }
        Insert: {
          address?: string | null
          address_string?: string | null
          agencyid?: string | null
          apt?: string | null
          archived?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          name?: string | null
          postal?: string | null
          price?: number | null
          propertyid?: string
          province?: string | null
        }
        Update: {
          address?: string | null
          address_string?: string | null
          agencyid?: string | null
          apt?: string | null
          archived?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          name?: string | null
          postal?: string | null
          price?: number | null
          propertyid?: string
          province?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_agencyid_fkey"
            columns: ["agencyid"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      property_questions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_required: boolean | null
          order_index: number | null
          property_id: string
          question_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          property_id: string
          question_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          property_id?: string
          question_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_questions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["propertyid"]
          },
        ]
      }
      propertyimages: {
        Row: {
          created_at: string
          id: number
          propertyid: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          propertyid?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          propertyid?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propertyimages_propertyid_fkey"
            columns: ["propertyid"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["propertyid"]
          },
        ]
      }
      users: {
        Row: {
          agencyid: string | null
          availability: Json | null
          bookings: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone_number: string | null
          profile_picture: string | null
          property: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          agencyid?: string | null
          availability?: Json | null
          bookings?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          name: string
          phone_number?: string | null
          profile_picture?: string | null
          property?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          agencyid?: string | null
          availability?: Json | null
          bookings?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone_number?: string | null
          profile_picture?: string | null
          property?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_agencyid_fkey"
            columns: ["agencyid"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
