"use client";

import React, { useState } from "react";
import { createEvent, CreateEventReq } from "@/actions/events";
import { ChannelWithUserName, fetchChannels } from "@/actions/channels";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Autocomplete,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { User, fetchCurrentUser } from "@/actions/fetchUsers";
import OrganizerSelector from "./OrganizerSelector";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import { getUserResolution } from "@/actions/resolution";
import axios from "@/lib/axios";

dayjs.extend(utc);
dayjs.extend(timezone);

const timezones = Intl.supportedValuesOf("timeZone").sort();

type Resolution = "360p" | "480p" | "720p" | "1080p" | "1440p" | "4K";

const RESOLUTION_ORDER: Resolution[] = ["720p", "1080p", "1440p", "4K"];

const getAllowedResolutions = (maxQuality: Resolution): Resolution[] => {
  const maxIndex = RESOLUTION_ORDER.indexOf(maxQuality);
  if (maxIndex === -1) return ["720p"];
  return RESOLUTION_ORDER.slice(0, maxIndex + 1);
};

interface EventFormProps {
  channel?: ChannelWithUserName;
  onBack: () => void;
  onEventCreated?: () => void;
  onError?: (message: string) => void;
  eventToEdit?: CreateEventReq & { resolution?: string };
  onEventUpdated?: (eventId: string, data: Partial<CreateEventReq>) => void;
}

const CreateEvent: React.FC<EventFormProps> = ({
  channel,
  onBack,
  onEventCreated,
  onError,
  eventToEdit,
  onEventUpdated,
}) => {
  const detectedTimezone = dayjs.tz.guess();

  const [availableChannels, setAvailableChannels] = useState<
    ChannelWithUserName[]
  >([]);

  const [selectedTimezone, setSelectedTimezone] = useState(detectedTimezone);
  const [loading, setLoading] = useState(false);
  const [resolutionLoading, setResolutionLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Resolution state
  const [maxQuality, setMaxQuality] = useState<Resolution>("720p");
  const [defaultResolution, setDefaultResolution] =
    useState<Resolution>("720p");
  const [resolution, setResolution] = useState<Resolution>("720p");

  const [formData, setFormData] = useState<CreateEventReq>({
    title: eventToEdit ? eventToEdit.title : "",
    description: eventToEdit ? eventToEdit.description : "",
    occurs: eventToEdit ? eventToEdit.occurs : "once",
    start_date: eventToEdit ? eventToEdit.start_date : new Date(),
    end_date: eventToEdit ? eventToEdit.end_date : new Date(),
    start_time: eventToEdit ? eventToEdit.start_time : new Date(),
    timezone: eventToEdit ? eventToEdit.timezone : detectedTimezone,
    organizer_ids: eventToEdit ? eventToEdit.organizer_ids : [],
    channel_name: channel ? channel.name : "",
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);

        if (userData && userData.first_name) {
          setFormData((prev) => ({
            ...prev,
            organizer_ids: [userData.id],
          }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (onError) {
          onError("Failed to load user data");
        }
      }
    };

    fetchUser();
  }, [onError]);

  React.useEffect(() => {
    if (!channel) {
      const loadChannels = async () => {
        try {
          const channelsResult = await fetchChannels();
          setAvailableChannels(channelsResult.channels);
        } catch (error) {
          console.error("Error fetching channels:", error);
          if (onError) {
            onError("Failed to load available channels");
          }
        }
      };

      loadChannels();
    }
  }, [channel, onError]);

  // Fetch resolution settings
  React.useEffect(() => {
    async function fetchResolutionData() {
      try {
        setResolutionLoading(true);

        // Fetch plan limits
        const limitsRes = await axios.get("/api/payments/limits");
        const planMax = (limitsRes.data?.max_quality || "720p") as Resolution;
        setMaxQuality(planMax);

        // Derive allowed resolutions from max_quality
        const allowed = getAllowedResolutions(planMax);

        if (eventToEdit?.resolution) {
          const editRes = eventToEdit.resolution as Resolution;
          setResolution(allowed.includes(editRes) ? editRes : planMax);
          setDefaultResolution(editRes);
        } else {
          const resolutionResult = await getUserResolution();
          if (
            resolutionResult.success &&
            resolutionResult.data?.default_resolution
          ) {
            const userDefault = resolutionResult.data.default_resolution as Resolution;
            setDefaultResolution(userDefault);
            setResolution(allowed.includes(userDefault) ? userDefault : planMax);
          } else {
            setDefaultResolution(planMax);
            setResolution(planMax);
          }
        }
      } catch (error) {
        console.error("Failed to fetch resolution data:", error);
        if (onError) {
          onError("Failed to load resolution settings");
        }
      } finally {
        setResolutionLoading(false);
      }
    }

    fetchResolutionData();
  }, [eventToEdit, onError]);

  const allowedResolutions = getAllowedResolutions(maxQuality);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);

    if (!formData.title.trim()) {
      if (onError) {
        onError("Event title is required.");
      }
      return;
    }

    if (formData.title.length < 3) {
      if (onError) {
        onError("Event title must be at least 3 characters long.");
      }
      return;
    }

    if (!formData.channel_name.trim()) {
      if (onError) {
        onError("Channel name is required.");
      }
      return;
    }

    if (formData.channel_name.length < 2) {
      if (onError) {
        onError("Channel name must be at least 2 characters long.");
      }
      return;
    }

    setLoading(true);

    try {
      const startTimeUTC = dayjs(formData.start_time)
        .tz(selectedTimezone)
        .utc()
        .toDate();

      const eventData: CreateEventReq & { resolution?: string } = {
        ...formData,
        start_time: startTimeUTC,
        resolution, // Include resolution in event data
      };

      if (eventToEdit && onEventUpdated) {
        await onEventUpdated(eventToEdit.title, eventData);
      } else {
        await createEvent(eventData);
      }
      if (onEventCreated) {
        onEventCreated();
      }

      onBack();
    } catch (err) {
      console.error("Error creating event:", err);
      if (err instanceof Error) {
        if (err.message === "DUPLICATE_TITLE") {
          setTitleError("This title is already taken");
          if (onError) {
            onError(
              "An event with this title already exists. Please choose a different title."
            );
          }
        } else if (err.message === "VALIDATION_ERROR") {
          if (onError) {
            onError("Please check your input data and try again.");
          }
        } else if (err.message === "SERVER_ERROR") {
          if (onError) {
            onError("Server error occurred. Please try again later.");
          }
        } else {
          if (onError) {
            onError("Failed to create event. Please try again.");
          }
        }
      } else {
        if (onError) {
          onError("An unexpected error occurred.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResolutionChange = (event: SelectChangeEvent) => {
    setResolution(event.target.value as Resolution);
  };

  // Shared sx for consistent input styling
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      "&:hover fieldset": { borderColor: "#0ea5e9" },
      "&.Mui-focused fieldset": { borderColor: "#0ea5e9" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0ea5e9" },
    marginBottom: "12px",
  };

  const selectSx = {
    borderRadius: "12px",
    backgroundColor: "#fff",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0ea5e9",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0ea5e9",
    },
    marginBottom: "12px",
  };

  const pickerSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      "&:hover fieldset": { borderColor: "#0ea5e9" },
      "&.Mui-focused fieldset": { borderColor: "#0ea5e9" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0ea5e9" },
    
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <div
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-sky-50 cursor-pointer transition-colors"
        >
          <NavigateBeforeRoundedIcon
            sx={{
              width: "22px",
              height: "22px",
              color: "#64748b",
            }}
          />
        </div>
        <h1 className="text-xl font-semibold text-slate-800">
          {eventToEdit
            ? `Edit Event: ${eventToEdit.title}`
            : channel
              ? `Create New Event for ${channel.name}`
              : "Create New Event"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Event Details Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Event Details
          </h2>

          <div className="space-y-2.5">
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!titleError}
              helperText={titleError}
              sx={inputSx}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={inputSx}
            />
          </div>
        </div>

        {/* ── Schedule Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Schedule
          </h2>

          <div className="space-y-2.5">
            <FormControl fullWidth>
              <InputLabel
                sx={{ "&.Mui-focused": { color: "#0ea5e9" } }}
              >
                Occurrence
              </InputLabel>
              <Select
                name="occurs"
                value={formData.occurs}
                label="Occurrence"
                onChange={(e) => {
                  const { value } = e.target;
                  setFormData((prev) => ({ ...prev, occurs: value }));
                }}
                sx={selectSx}
              >
                <MenuItem value="once">Once</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => {
                    if (date)
                      setFormData((prev) => ({ ...prev, start_date: date }));
                  }}
                  sx={pickerSx}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => {
                    if (date)
                      setFormData((prev) => ({ ...prev, end_date: date }));
                  }}
                  minDate={formData.start_date}
                  sx={pickerSx}
                />
              </LocalizationProvider>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formData.start_time}
                  onChange={(time) => {
                    if (time)
                      setFormData((prev) => ({ ...prev, start_time: time }));
                  }}
                  sx={pickerSx}
                />
              </LocalizationProvider>

              <Autocomplete
                options={timezones}
                value={selectedTimezone}
                onChange={(_, newValue) => {
                  if (newValue) setSelectedTimezone(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Timezone"
                    helperText="Select your timezone"
                    fullWidth
                    sx={inputSx}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Streaming Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Streaming
          </h2>

          {resolutionLoading ? (
            <div className="flex items-center justify-center py-6">
              <CircularProgress size={24} sx={{ color: "#0ea5e9" }} />
            </div>
          ) : (
            <div>
              <FormControl fullWidth>
                <InputLabel
                  id="event-resolution-label"
                  sx={{ "&.Mui-focused": { color: "#0ea5e9" } }}
                >
                  Stream Resolution
                </InputLabel>
                <Select
                  labelId="event-resolution-label"
                  id="event-resolution-select"
                  value={resolution}
                  label="Stream Resolution"
                  onChange={handleResolutionChange}
                  sx={selectSx}
                >
                  {allowedResolutions.map((res) => (
                    <MenuItem key={res} value={res}>
                      {res}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <p className="text-xs text-slate-400 mt-3">
                Default from settings:{" "}
                <span className="font-medium text-slate-500">{defaultResolution}</span>
                {" · "}Maximum for your plan:{" "}
                <span className="font-medium text-slate-500">{maxQuality}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── People & Channel Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            People & Channel
          </h2>

          <div className="space-y-2.5">
            <OrganizerSelector
              organizer_ids={formData.organizer_ids}
              currentUser={user}
              onAddOrganizer={(newOrganizerId) => {
                setFormData((prev) => ({
                  ...prev,
                  organizer_ids: [...prev.organizer_ids, newOrganizerId],
                }));
              }}
              onRemoveOrganizer={(organizerId) => {
                const newOrganizers = formData.organizer_ids.filter(
                  (id) => id !== organizerId
                );
                setFormData((prev) => ({
                  ...prev,
                  organizer_ids: newOrganizers,
                }));
              }}
            />

            {channel ? (
              <TextField
                label="Channel Name"
                name="channel_name"
                value={formData.channel_name}
                required
                fullWidth
                variant="outlined"
                disabled
                sx={inputSx}
              />
            ) : (
              <Autocomplete
                fullWidth
                freeSolo
                options={availableChannels.map((channel) => channel.name)}
                value={formData.channel_name}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    channel_name: newValue || "",
                  }));
                }}
                onInputChange={(event, newInputValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    channel_name: newInputValue,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Channel"
                    name="channel_name"
                    required
                    variant="outlined"
                    helperText="Select an existing channel or type a new channel name"
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-400 mr-2">📁</span>
                        {option}
                      </div>
                    </li>
                  );
                }}
                noOptionsText="Type to create a new channel"
              />
            )}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outlined"
            onClick={onBack}
            sx={{
              padding: "10px 28px",
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "12px",
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": {
                borderColor: "#cbd5e1",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              padding: "10px 28px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #0284c7 0%, #0891b2 100%)",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
              },
            }}
            disabled={loading || resolutionLoading}
          >
            {loading
              ? eventToEdit
                ? "Updating..."
                : "Creating..."
              : eventToEdit
                ? "Update Event"
                : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
