import { supabase } from "@/lib/supabaseClient";
import { Property, PropertyQuestion } from '@/types/property';

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters: string) => [...propertyKeys.lists(), { filters }] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};
// Get property questions
export const getPropertyQuestions = async (propertyId: string): Promise<PropertyQuestion[]> => {
  const { data, error } = await supabase
    .from('property_questions')
    .select('*')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('order_index');
  
  if (error) throw error;
  return data || [];
};

// Add a new property question
export const addPropertyQuestion = async (question: Omit<PropertyQuestion, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<PropertyQuestion> => {
  console.log('Adding question:', question); // Debug log
  
  try {
    const { data, error } = await supabase
      .from('property_questions')
      .insert([question])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error adding question:', error);
      throw error;
    }
    
    console.log('Question added successfully:', data);
    return data;
  } catch (err) {
    console.error('Exception in addPropertyQuestion:', err);
    throw err;
  }
};

// Update property questions (batch operation)
export const updatePropertyQuestions = async (questions: Pick<PropertyQuestion, 'id' | 'question_text' | 'is_required' | 'order_index'>[]): Promise<void> => {
  const updatePromises = questions.map(question => 
    supabase
      .from('property_questions')
      .update({
        question_text: question.question_text,
        is_required: question.is_required,
        order_index: question.order_index,
        updated_at: new Date().toISOString()
      })
      .eq('id', question.id)
  );
  
  await Promise.all(updatePromises);
};

// Delete a property question (soft delete)
export const deletePropertyQuestion = async (questionId: string): Promise<void> => {
  console.log('Deleting question:', questionId); // Debug log
  
  try {
    const { error } = await supabase
      .from('property_questions')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', questionId);
    
    if (error) {
      console.error('Supabase error deleting question:', error);
      throw error;
    }
    
    console.log('Question deleted successfully');
  } catch (err) {
    console.error('Exception in deletePropertyQuestion:', err);
    throw err;
  }
};

export const propertiesApi = {
  
  fetchUserProperties: async function () {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: properties, error: propertiesError } = await supabase
      .from("property")
      .select("*")
      .eq("userid", user.id);

    if (propertiesError) throw propertiesError;

    return properties;
  },

  fetchPropertyImage: async function (propertyid: string) {
    const { data: images, error: imagesError } = await supabase
      .from("propertyimages")
      .select("url")
      .eq("propertyid", propertyid)
      .limit(1)
      .single();

    if (imagesError) {
      console.error("Error fetching image:", imagesError);
      return "/api/placeholder/300/200";
    }

    return images?.url;
  },

  async fetchPropertyImages(propertyId: string) {
    console.log('Fetching images for property:', propertyId); // Debug log
    
    const { data, error } = await supabase
      .from('propertyimages')
      .select('*')
      .eq('propertyid', propertyId); // Changed from property_id to propertyid

    if (error) {
      console.error('Error fetching images:', error);
      throw error;
    }

    console.log('Raw images data:', data); // Debug log
    
    if (!data || data.length === 0) {
      console.log('No images found for property:', propertyId);
      return [];
    }

    return data.map(img => ({
      url: img.url || img.image_url // Handle both possible column names
    }));
  },

  fetchPropertyById: async function (propertyId: string) {
    const { data: property, error: propertyError } = await supabase
      .from("property")
      .select("*")
      .eq("propertyid", propertyId)
      .single();

    if (propertyError) throw propertyError;

    return property;
  },

  fetchPropertyQuestions: getPropertyQuestions,
  addPropertyQuestion,
  updatePropertyQuestions,
  deletePropertyQuestion
};

