import { Database } from "./supabase";

export type Property = Database["public"]["Tables"]["property"]["Row"];
export type PropertyAndImage = Property & { image_url: string };

export type PropertyUpdate = Database["public"]["Tables"]["property"]["Update"];
export type PropertyInsert = Database["public"]["Tables"]["property"]["Insert"];
export type PropertyImage = Database["public"]["Tables"]["propertyimages"]["Row"];
export type PropertyImageInsert = Database["public"]["Tables"]["propertyimages"]["Insert"];
export type PropertyImageUpdate = Database["public"]["Tables"]["propertyimages"]["Update"];

// Property Questions
export type PropertyQuestion = Database["public"]["Tables"]["property_questions"]["Row"];
export type PropertyQuestionInsert = Database["public"]["Tables"]["property_questions"]["Insert"];
export type PropertyQuestionUpdate = Database["public"]["Tables"]["property_questions"]["Update"];

// Custom type for simplified question operations
export interface PropertyQuestionSimple {
  id: string;
  property_id: string;
  question_text: string;
  is_required: boolean;
  order_index: number;
}

// Type for creating a new question
export type NewPropertyQuestion = Omit<PropertyQuestionInsert, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Type for updating question order
export type QuestionOrderUpdate = Pick<PropertyQuestion, 'id' | 'order_index'>;

// Type for question with validation results
export interface QuestionWithAnswer {
  id: string;
  question_text: string;
  is_required: boolean;
  answer: string;
  isValid: boolean;
}
