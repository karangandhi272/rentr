import { supabase } from "@/lib/supabaseClient";
import { Property, PropertyUpdate, PropertyQuestion, PropertyQuestionInsert } from '@/types/property';

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters: string) => [...propertyKeys.lists(), { filters }] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

// Get property questions
export const getPropertyQuestions = async (propertyId: string): Promise<PropertyQuestion[]> => {
  console.log('Fetching questions for property:', propertyId);
  
  try {
    const { data, error } = await supabase
      .from('property_questions')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching property questions:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getPropertyQuestions:', err);
    throw err;
  }
};

// Add a new property question
export const addPropertyQuestion = async (
  question: {
    property_id: string;
    question_text: string;
    is_required: boolean;
    order_index: number;
  }
): Promise<PropertyQuestion> => {
  console.log('Adding question:', question);
  
  try {
    const { data, error } = await supabase
      .from('property_questions')
      .insert([question])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding property question:', error);
      throw error;
    }
    
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
  console.log('Soft deleting question:', questionId);
  
  try {
    const { error } = await supabase
      .from('property_questions')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', questionId);
    
    if (error) {
      console.error('Error soft deleting property question:', error);
      throw error;
    }
    
    console.log('Question soft deleted successfully');
  } catch (err) {
    console.error('Exception in deletePropertyQuestion:', err);
    throw err;
  }
};

// Check if a question exists in the database
export const checkQuestionExists = async (questionId: string): Promise<boolean> => {
  console.log('Checking if question exists:', questionId);
  
  try {
    const { data, error } = await supabase
      .from('property_questions')
      .select('id')
      .eq('id', questionId)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      // If error is 'no rows returned', it means the question doesn't exist
      if (error.code === 'PGRST116') {
        return false;
      }
      
      throw error;
    }
    
    return !!data;
  } catch (err) {
    console.error('Exception in checkQuestionExists:', err);
    return false;
  }
};

// Update a single question
export const updatePropertyQuestion = async (
  questionId: string, 
  updates: { 
    question_text?: string; 
    is_required?: boolean; 
    order_index?: number; 
  }
): Promise<PropertyQuestion> => {
  console.log('Updating question:', questionId, updates);
  
  try {
    const { data, error } = await supabase
      .from('property_questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
    
    console.log('Question updated successfully:', data);
    return data;
  } catch (err) {
    console.error('Exception in updatePropertyQuestion:', err);
    throw err;
  }
};

// Update property
export const updateProperty = async (
  propertyId: string, 
  updates: Partial<PropertyUpdate>
) => {
  console.log('Updating property:', propertyId, updates);
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('propertyid', propertyId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating property:', error);
      return { data: null, error };
    }
    
    console.log('Property updated successfully:', data);
    return { data, error: null };
  } catch (err) {
    console.error('Exception in updateProperty:', err);
    return { data: null, error: err };
  }
};

export const propertiesApi = {
  
  fetchUserProperties: async function () {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    try {
      // First get the user's agency ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("agencyid")
        .eq("id", user.id)
        .single();
        
      if (userError) {
        console.error("Failed to get user agency:", userError);
        return [];
      }
      
      if (!userData?.agencyid) {
        console.log("User has no agency association");
        return [];
      }

      // Then get properties for that agency
      const { data: properties, error: propertiesError } = await supabase
        .from("property")
        .select("*")
        .eq("agencyid", userData.agencyid);

      if (propertiesError) {
        console.error("Failed to fetch properties:", propertiesError);
        return [];
      }

      return properties || [];
    } catch (err) {
      console.error("Error in fetchUserProperties:", err);
      return [];
    }
  },

  // Fetch properties for a specific agency directly
  fetchAgencyProperties: async function(agencyId: string) {
    if (!agencyId) {
      return [];
    }
    
    try {
      const { data: properties, error: propertiesError } = await supabase
        .from("property")
        .select("*")
        .eq("agencyid", agencyId);

      if (propertiesError) {
        console.error("Failed to fetch agency properties:", propertiesError);
        return [];
      }

      return properties || [];
    } catch (err) {
      console.error("Error in fetchAgencyProperties:", err);
      return [];
    }
  },

  fetchPropertyImage: async function (propertyid: string) {
    try {
      const { data: images, error: imagesError } = await supabase
        .from("propertyimages")
        .select("url")
        .eq("propertyid", propertyid)
        .limit(1)
        .single();

      if (imagesError) {
        console.log("Property has no images");
        return "/api/placeholder/300/200";
      }

      return images?.url;
    } catch (err) {
      console.error("Error fetching property image:", err);
      return "/api/placeholder/300/200";
    }
  },

  async fetchPropertyImages(propertyId: string) {
    try {
      console.log('Fetching images for property:', propertyId);
      
      const { data, error } = await supabase
        .from('propertyimages')
        .select('*')
        .eq('propertyid', propertyId);

      if (error) {
        console.error('Error fetching images:', error);
        return [];
      }

      console.log('Raw images data:', data);
      
      if (!data || data.length === 0) {
        console.log('No images found for property:', propertyId);
        return [];
      }

      return data.map(img => ({
        url: img.url || img.image_url
      }));
    } catch (err) {
      console.error("Error in fetchPropertyImages:", err);
      return [];
    }
  },

  fetchPropertyById: async function (propertyId: string) {
    try {
      const { data: property, error: propertyError } = await supabase
        .from("property")
        .select("*")
        .eq("propertyid", propertyId)
        .single();

      if (propertyError) {
        console.error("Failed to fetch property:", propertyError);
        return null;
      }

      return property;
    } catch (err) {
      console.error("Error in fetchPropertyById:", err);
      return null;
    }
  },

  // Create a new property with the agency ID
  createProperty: async function(propertyData: Omit<Property, "propertyid" | "created_at">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // First get the user's agency ID if not provided
      if (!propertyData.agencyid) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("agencyid")
          .eq("id", user.id)
          .single();
          
        if (userError) {
          throw new Error("Failed to get user agency information");
        }
        
        if (!userData?.agencyid) {
          throw new Error("User is not associated with any agency");
        }
        
        // Add the agency ID to the property data
        propertyData.agencyid = userData.agencyid;
      }
      
      // Add created_by field to track which user created the property
      propertyData.created_by = user.id;
      
      // Create the property
      const { data, error } = await supabase
        .from("property")
        .insert([propertyData])
        .select();
        
      if (error) {
        console.error("Failed to create property:", error);
        throw error;
      }
      
      return data?.[0];
    } catch (err) {
      console.error("Error in createProperty:", err);
      throw err;
    }
  },

  fetchPropertyQuestions: getPropertyQuestions,
  addPropertyQuestion,
  updatePropertyQuestion,
  deletePropertyQuestion,
  checkQuestionExists,
  updatePropertyQuestions,
  updateProperty
};

