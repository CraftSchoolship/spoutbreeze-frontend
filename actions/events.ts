import axiosInstance from "@/lib/axios";
import axios from "axios";

export interface Organizers {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  occurs: string;
  start_date: string;
  end_date: string;
  start_time: string;
  creator_id: string;
  creator_first_name: string;
  creator_last_name: string;
  organizers: Organizers[];
  channel_id: string;
  meeting_id: string | null;
  moderator_pw: string | null;
  attendee_pw: string | null;
  meeting_created: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  actual_start_time: string | null;
  actual_end_time: string | null;
}

export interface EventWithUserName extends Event {
  creator_name: string;
}

export interface Events {
  events: EventWithUserName[];
  total: number;
}

export interface CreateEventReq {
  title: string;
  description: string;
  occurs: string;
  start_date: Date;
  end_date: Date;
  start_time: Date;
  timezone: string;
  organizer_ids: string[];
  channel_name: string;
}

export interface JoinUrls {
  attendee_join_url: string;
  moderator_join_url: string;
}

export const fetchEvents = async (): Promise<Events> => {
  try {
    const response = await axiosInstance.get("/api/events/all");
    console.log("Fetch events response:", response.data);

    // Transform the response to include creator_name
    const eventsWithUserName: EventWithUserName[] = response.data.events.map(
      (event: Event) => ({
        ...event,
        creator_name: `${event.creator_first_name} ${event.creator_last_name}`,
      })
    );

    return {
      events: eventsWithUserName,
      total: response.data.total,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return { events: [], total: 0 };
      }
      
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const fetchEventsByChannelId = async (channelId: string): Promise<Events> => {
  try {
    const response = await axiosInstance.get(`/api/events/channel/${channelId}`);
    console.log("Fetch events by channel response:", response.data);

    // Transform the response to include creator_name
    const eventsWithUserName: EventWithUserName[] = response.data.events.map(
      (event: Event) => ({
        ...event,
        creator_name: `${event.creator_first_name} ${event.creator_last_name}`,
      })
    );

    return {
      events: eventsWithUserName,
      total: response.data.total,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return { events: [], total: 0 };
      }
      
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const fetchUpcmingEvents = async (): Promise<Events> => {
  try {
    const response = await axiosInstance.get("/api/events/upcoming");
    console.log("Fetch upcoming events response:", response.data);

    // Transform the response to include creator_name
    const eventsWithUserName: EventWithUserName[] = response.data.events.map(
      (event: Event) => ({
        ...event,
        creator_name: `${event.creator_first_name} ${event.creator_last_name}`,
      })
    );

    return {
      events: eventsWithUserName,
      total: response.data.total,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return { events: [], total: 0 };
      }
      
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const fetchPastEvents = async (): Promise<Events> => {
  try {
    const response = await axiosInstance.get("/api/events/past");
    console.log("Fetch past events response:", response.data);

    // Transform the response to include creator_name
    const eventsWithUserName: EventWithUserName[] = response.data.events.map(
      (event: Event) => ({
        ...event,
        creator_name: `${event.creator_first_name} ${event.creator_last_name}`,
      })
    );

    return {
      events: eventsWithUserName,
      total: response.data.total,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return { events: [], total: 0 };
      }
      
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const fetchLiveEvents = async (): Promise<Events> => {
  try {
    const response = await axiosInstance.get("/api/events/live");
    console.log("Fetch live events response:", response.data);

    // Transform the response to include creator_name
    const eventsWithUserName: EventWithUserName[] = response.data.events.map(
      (event: Event) => ({
        ...event,
        creator_name: `${event.creator_first_name} ${event.creator_last_name}`,
      })
    );

    return {
      events: eventsWithUserName,
      total: response.data.total,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return { events: [], total: 0 };
      }
      
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const createEvent = async (data: CreateEventReq): Promise<Event | null> => {
  try {
    const response = await axiosInstance.post("/api/events/", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      
      // Handle specific backend errors
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || "";
        
        // Check for duplicate title error
        if (errorMessage.includes("already exists")) {
          throw new Error("DUPLICATE_TITLE");
        }
        
        throw new Error("VALIDATION_ERROR");
      }
      
      if (error.response?.status === 422) {
        throw new Error("VALIDATION_ERROR");
      }
      
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.detail || "";
        
        if (errorMessage.includes("duplicate key value violates unique constraint") && 
            errorMessage.includes("events_title_key")) {
          throw new Error("DUPLICATE_TITLE");
        }
        
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const startEvent = async (eventId: string): Promise<string> => {
  try {
    const response = await axiosInstance.post(`/api/events/${eventId}/start`);
    return response.data.join_url;
  } catch (error) {
    console.error("Error starting event:", error);
    if (axios.isAxiosError(error) && error.response) {
      const detail: string = error.response.data?.detail ?? "";
      if (error.response.status === 403) {
        throw new Error("EVENT_FORBIDDEN");
      }
      if (error.response.status === 404) {
        throw new Error("EVENT_NOT_FOUND");
      }
      // Surface the backend detail (e.g. "Failed to create meeting: internalError")
      throw new Error(detail || "START_EVENT_FAILED");
    }
    throw error;
  }
};

export const updateEvent = async (eventId: string, data: Partial<CreateEventReq>): Promise<Event | null> => {
  try {
    const response = await axiosInstance.put(`/api/events/${eventId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      
      // Handle specific backend errors
      if (error.response?.status === 400) {
        throw new Error("VALIDATION_ERROR");
      }
      
      if (error.response?.status === 404) {
        throw new Error("EVENT_NOT_FOUND");
      }
      
      if (error.response?.status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const getJoinUrl = async (eventId: string): Promise<JoinUrls | null> => {
  try {
    const response = await axiosInstance.post(`/api/events/${eventId}/join-url`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      
      if (error.response?.status === 404) {
        throw new Error("EVENT_NOT_FOUND");
      }
      
      if (error.response?.status === 400) {
        throw new Error("EVENT_NOT_STARTED");
      }
      
      if (error.response?.status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const getJoinUrlWithName = async (eventId: string, fullName: string, role: 'attendee' | 'moderator' = 'attendee'): Promise<string | null> => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/join-url`, {
      full_name: fullName
    });
    
    return role === 'moderator' ? response.data.moderator_join_url : response.data.attendee_join_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      
      if (error.response?.status === 404) {
        throw new Error("EVENT_NOT_FOUND");
      }
      
      if (error.response?.status === 400) {
        throw new Error("EVENT_NOT_STARTED");
      }
      
      if (error.response?.status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/events/${eventId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);

      if (error.response?.status === 403) {
        throw new Error("EVENT_FORBIDDEN");
      }

      if (error.response?.status === 404) {
        throw new Error("EVENT_NOT_FOUND");
      }

      if (error.response?.status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }
    throw error;
  }
}