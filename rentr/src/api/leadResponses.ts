import { supabase } from "@/lib/supabaseClient";

export interface QuestionResponse {
  id: string;
  response: string;
  question: {
    id: string;
    question_text: string;
    is_required: boolean;
  };
}

export interface LeadWithResponses {
  id: string;
  name: string;
  email: string;
  number: string;
  date: string;
  property: {
    name: string;
    address: string;
  };
  responses: QuestionResponse[];
}

export const fetchLeadWithResponses = async (leadId: string): Promise<LeadWithResponses> => {
  // First get the lead details
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select(`
      id,
      name,
      email, 
      number,
      date,
      property:property (
        name,
        address
      )
    `)
    .eq('id', leadId)
    .single();

  if (leadError) throw leadError;
  if (!lead) throw new Error('Lead not found');

  // Then get the responses with their questions
  const { data: responses, error: responsesError } = await supabase
    .from('question_responses')
    .select(`
      id,
      response,
      question:property_questions (
        id, 
        question_text,
        is_required
      )
    `)
    .eq('lead_id', leadId);

  if (responsesError) throw responsesError;

  // Format the responses
  const formattedResponses = responses?.map(item => ({
    id: item.id,
    response: item.response,
    question: item.question
  })) || [];

  return {
    ...lead,
    responses: formattedResponses
  };
};
