import { supabase } from "@/lib/supabaseClient";

/**
 * Get events for all properties in an agency
 */
export const getAgencyEvents = async (agencyId: string) => {
  if (!agencyId) {
    return [];
  }

  try {
    // First, get all properties for the agency
    const { data: properties, error: propsError } = await supabase
      .from("property")
      .select("propertyid")
      .eq("agencyid", agencyId);

    if (propsError) {
      console.error("Failed to fetch agency properties:", propsError);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map(p => p.propertyid);

    // Then get all events for these properties
    const { data: events, error: eventsError } = await supabase
      .from("leads")
      .select("*, property_details:property(*)")
      .in("propertyid", propertyIds)
      .not("date", "is", null);

    if (eventsError) {
      console.error("Failed to fetch events:", eventsError);
      return [];
    }

    return events || [];
  } catch (err) {
    console.error("Error in getAgencyEvents:", err);
    return [];
  }
};

/**
 * Add a new event for a property
 */
export const addEvent = async (event: {
  propertyid: string,
  name: string,
  email: string,
  phone?: string,
  date: string, // ISO date string
  notes?: string,
  status?: string,
}) => {
  try {
    // Get property to ensure it exists
    const { data: property, error: propError } = await supabase
      .from("property")
      .select("agencyid")
      .eq("propertyid", event.propertyid)
      .single();

    if (propError) {
      console.error("Failed to verify property:", propError);
      throw new Error("Invalid property ID");
    }

    // Create the event
    const { data, error } = await supabase
      .from("leads")
      .insert([{
        ...event,
        agencyid: property.agencyid, // Link lead directly to agency too
        created_at: new Date().toISOString(),
        status: event.status || "scheduled",
      }])
      .select();

    if (error) {
      console.error("Failed to create event:", error);
      throw error;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error in addEvent:", err);
    throw err;
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (
  eventId: string,
  updates: Partial<{
    name: string,
    email: string,
    phone: string,
    date: string,
    notes: string,
    status: string,
  }>
) => {
  try {
    const { data, error } = await supabase
      .from("leads")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Failed to update event:", error);
      throw error;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error in updateEvent:", err);
    throw err;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId: string) => {
  try {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteEvent:", err);
    throw err;
  }
};

export const calendarApi = {
  getAgencyEvents,
  addEvent,
  updateEvent,
  deleteEvent,
};
