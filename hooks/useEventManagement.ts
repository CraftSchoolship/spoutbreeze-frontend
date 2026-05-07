import { useState } from "react";
import {
  startEvent,
  deleteEvent,
  updateEvent,
  CreateEventReq,
} from "@/actions/events";

interface UseEventManagementOptions {
  onDeleteSuccess?: () => void;
  onDeleteError?: (message: string) => void;
  onStartSuccess?: () => void;
  onStartError?: (message: string) => void;
  onUpdateSuccess?: () => void;
  onUpdateError?: (message: string) => void;
}

export const useEventManagement = (options?: UseEventManagementOptions) => {
  const [eventError, setEventError] = useState<string | null>(null);
  const [menuState, setMenuState] = useState<{
    anchorEl: HTMLElement | null;
    eventId: string | null;
  }>({
    anchorEl: null,
    eventId: null,
  });

  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    eventId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      eventId: eventId,
    });
  };

  const handleClose = () => {
    setMenuState({
      anchorEl: null,
      eventId: null,
    });
  };

  // Function to handle updating an event
  const handleUpdateEvent = async (
    eventId: string,
    data: Partial<CreateEventReq>
  ) => {
    try {
      const updatedEvent = await updateEvent(eventId, data);
      if (updatedEvent) {
        console.log("Event updated successfully:", updatedEvent);
        options?.onUpdateSuccess?.();
        return true;
      } else {
        const errorMessage = "Failed to update the event. Please try again.";
        setEventError(errorMessage);
        options?.onUpdateError?.(errorMessage);
        console.error("Error updating event:", errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = "Failed to update the event. Please try again.";
      setEventError(errorMessage);
      options?.onUpdateError?.(errorMessage);
      console.error("Error updating event:", error);
      return false;
    }
  };

  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      console.log("Event deleted successfully");
      options?.onDeleteSuccess?.();
      return true;
    } catch (error) {
      let errorMessage = "Failed to delete the event. Please try again.";
      if (error instanceof Error) {
        if (error.message === "EVENT_FORBIDDEN") {
          errorMessage = "Only the event creator can delete this event.";
        } else if (error.message === "EVENT_NOT_FOUND") {
          errorMessage = "This event no longer exists.";
        } else if (error.message === "SERVER_ERROR") {
          errorMessage = "A server error occurred while deleting the event. Please try again later.";
        }
      }
      setEventError(errorMessage);
      options?.onDeleteError?.(errorMessage);
      console.error("Error deleting event:", error);
      return false;
    }
  };

  // Function to handle starting an event
  const handleStartEvent = async (eventId: string) => {
    try {
      const joinUrl = await startEvent(eventId);
      console.log("Join URL:", joinUrl);
      window.open(joinUrl, "_blank");
      options?.onStartSuccess?.();
      return true;
    } catch (error) {
      let errorMessage = "Failed to start the event. Please try again.";
      if (error instanceof Error) {
        if (error.message === "EVENT_FORBIDDEN") {
          errorMessage = "Only the event creator can start this event.";
        } else if (error.message === "EVENT_NOT_FOUND") {
          errorMessage = "This event no longer exists.";
        } else if (error.message === "START_EVENT_FAILED") {
          errorMessage = "Failed to start the event. Please try again.";
        } else if (error.message) {
          // Show the backend detail directly (e.g. "Failed to create meeting: internalError")
          errorMessage = error.message;
        }
      }
      setEventError(errorMessage);
      options?.onStartError?.(errorMessage);
      console.error("Error starting event:", error);
      return false;
    }
  };

  // Simplify the get join URL function since we don't need to call the API
  const handleGetJoinUrl = async (_eventId: string): Promise<void> => {
    // No need to make API call anymore, just pass the eventId to the dialog
    // The dialog will generate shareable URLs using getShareableJoinUrl
    return Promise.resolve();
  };

  const open = Boolean(menuState.anchorEl);

  return {
    eventError,
    menuState,
    open,
    handleClick,
    handleClose,
    handleStartEvent,
    handleDeleteEvent,
    handleUpdateEvent,
    handleGetJoinUrl,
  };
};
