"use client";

import React, { useCallback, useEffect } from "react";
import { ChannelWithUserName } from "@/actions/channels";
import {
  fetchEventsByChannelId,
  Events,
} from "@/actions/events";
import CreateEvent from "@/components/home/events/CreateEvent";
import EventList from "../events/EventList";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import { useEventManagement } from "@/hooks/useEventManagement";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";
import { convertEventToCreateEventReq } from "@/utils/eventUtils";
import { getChannelRecordings, ChannelRecordingsResponse } from "@/actions/recordings";
import RecordingsTable from "@/components/common/RecordingsTable";

interface ChannelPageProps {
  channel: ChannelWithUserName;
  onBack: () => void;
  channelId: string;
}

export const eventMenuItems = [
  {
    key: "start",
    label: "Start",
    icon: "/events/play_icon.svg",
  },
  {
    key: "share",
    label: "Share",
    icon: "/events/share_icon.svg",
  },
  {
    key: "edit",
    label: "Edit",
    icon: "/events/edit_icon.svg",
  },
  {
    key: "delete",
    label: "Delete",
    icon: "/delete_icon_outlined.svg",
  },
];

const ChannelPage: React.FC<ChannelPageProps> = ({
  channel,
  onBack,
  channelId,
}) => {
  const [eventsData, setEventsData] = React.useState<Events>({
    events: [],
    total: 0,
  });
  const [recordingsData, setRecordingsData] = React.useState<ChannelRecordingsResponse>({
    recordings: [],
    total_recordings: 0,
  });
  const [recordingsLoading, setRecordingsLoading] = React.useState(true);
  const [recordingsError, setRecordingsError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [editingEventId, setEditingEventId] = React.useState<string | null>(null);

  const { showSnackbar } = useGlobalSnackbar();

  // Use the custom hook with callbacks
  const {
    menuState,
    handleClick,
    handleClose,
    handleStartEvent,
    handleDeleteEvent,
    handleUpdateEvent,
    handleGetJoinUrl,
  } = useEventManagement({
    onDeleteSuccess: () => {
      showSnackbar("Event deleted successfully!", "success");
      fetchEvents();
    },
    onDeleteError: (message: string) => {
      showSnackbar(message, "error");
    },
    onStartSuccess: () => {
      showSnackbar("Event started successfully!", "success");
    },
    onStartError: (message: string) => {
      showSnackbar(message, "error");
    },
    onUpdateSuccess: () => {
      showSnackbar("Event updated successfully!", "success");
      fetchEvents();
      setEditingEventId(null);
      setShowEventForm(false);
    },
    onUpdateError: (message: string) => {
      showSnackbar(message, "error");
    },
  });

  // Fetch events by channel ID
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEventsByChannelId(channelId);
      // Success case - assuming the function returns Events directly
      setEventsData({ events: data.events, total: data.total });
      setError(null);
    } catch (err) {
      // Generic error handling
      setError("Failed to load events. Please try again later.");
      showSnackbar("Failed to load events", "error");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [channelId, showSnackbar]);

  // Add function to fetch recordings
  const fetchRecordings = useCallback(async () => {
    try {
      setRecordingsLoading(true);
      const data = await getChannelRecordings(channelId);
      setRecordingsData(data);
      setRecordingsError(null);
    } catch (err) {
      setRecordingsError("Failed to load recordings. Please try again later.");
      console.error("Error fetching recordings:", err);
    } finally {
      setRecordingsLoading(false);
    }
  }, [channelId]);

  // Update the useEffect to fetch both events and recordings
  useEffect(() => {
    fetchEvents();
    fetchRecordings();
  }, [fetchEvents, fetchRecordings]);

  const handleCreateEvent = () => {
    setShowEventForm(true);
  };

  const handleBackToChannel = () => {
    setShowEventForm(false);
  };

  // Handle successful event creation
  const handleEventCreated = async () => {
    // Refresh the events list
    await fetchEvents();
    // Show success message
    showSnackbar("Event created successfully!", "success");
  };

  // Handle event creation errors
  const handleEventError = (message: string) => {
    showSnackbar(message, "error");
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setShowEventForm(true);
  };

  if (showEventForm) {
    const eventToEdit = editingEventId
      ? eventsData.events.find(event => event.id === editingEventId)
      : undefined;

    const eventToEditReq = eventToEdit
      ? convertEventToCreateEventReq(eventToEdit, channel.name)
      : undefined;

    return (
      <section className="p-4 md:px-10 md:pt-10 h-full overflow-y-auto">
        <CreateEvent
          channel={channel}
          onBack={handleBackToChannel}
          onEventCreated={handleEventCreated}
          onError={handleEventError}
          eventToEdit={eventToEditReq}
          onEventUpdated={(_, data) => {
            if (editingEventId) {
              handleUpdateEvent(editingEventId, data);
            }
          }}
        />
      </section>
    );
  }

  return (
    <section className="p-4 md:px-10 md:pt-10 h-screen overflow-y-auto">
      {/* Channel header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex flex-col w-full md:w-auto">
          <button className="flex items-center font-medium text-[16px] md:text-[18px] -ml-1.5 mb-1.25">
            <NavigateBeforeRoundedIcon
              onClick={onBack}
              sx={{ cursor: "pointer" }}
            />
            {channel.name}
          </button>
          <span className="font-medium text-[12px] md:text-[13px] text-[#5B5D60]">
            {eventsData.total} Sessions | {recordingsData.total_recordings} Recordings
          </span>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <button
            className="flex-1 md:flex-none mb-0 md:mb-3.5 font-medium text-[13px] border p-2.5 text-[#27AAFF] rounded-xs cursor-pointer text-center"
            onClick={handleCreateEvent}
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Event list */}
      <div className="h-[350px] mt-6 md:mt-10 overflow-y-auto">
        <h1 className="text-[18px] md:text-[22px] text-[#262262] font-semibold mb-4 sticky top-0 bg-white pb-2 z-10">
          Upcoming events
        </h1>
        {!loading && !error && eventsData.events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-lg mb-2">No events found</p>
            <p className="text-sm text-center">
              Create your first event to get started
            </p>
            <button
              onClick={handleCreateEvent}
              className="mt-4 px-4 py-2 bg-[#27AAFF] text-white rounded-md text-sm hover:bg-[#2686BE] transition-colors"
            >
              Create Event
            </button>
          </div>
        ) : (
          <EventList
            loading={loading}
            error={error}
            eventsData={eventsData}
            eventMenuItems={eventMenuItems}
            handleClick={handleClick}
            handleClose={handleClose}
            menuState={menuState}
            handleStartEvent={handleStartEvent}
            handleDeleteEvent={handleDeleteEvent}
            handleEditEvent={handleEditEvent}
            handleGetJoinUrl={handleGetJoinUrl}
          />
        )}
      </div>

      {/* Updated Recordings section */}
      <div className="flex flex-col mt-6 h-auto md:h-[calc(50vh-80px)] overflow-y-auto">
        <h1 className="text-[18px] md:text-[22px] text-[#262262] font-semibold mb-4 sticky top-0 bg-white pb-2 z-10">
          Recordings ({recordingsData.total_recordings})
        </h1>

        {recordingsData.recordings.length === 0 && !recordingsLoading && !recordingsError ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-lg mb-2">No recordings found</p>
            <p className="text-sm text-center">
              Recordings will appear here after events are completed
            </p>
          </div>
        ) : (
          <RecordingsTable
            recordings={recordingsData.recordings}
            loading={recordingsLoading}
            error={recordingsError}
          />
        )}
      </div>
    </section>
  );
};

export default ChannelPage;
