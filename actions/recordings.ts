import axiosInstance from "@/lib/axios";
import axios from "axios";

export interface RecordingMetadata {
  isBreakout: string;
  meetingId: string;
  meetingName: string;
}

export interface RecordingBreakout {
  parentId: string;
  sequence: string;
  freeJoin: string;
}

export interface RecordingPlaybackFormat {
  type: string;
  url: string;
  processingTime: string;
  length: string;
  size: string;
}

export interface RecordingPlayback {
  format: RecordingPlaybackFormat;
}

export interface Recording {
  recordID: string;
  meetingID: string;
  internalMeetingID: string;
  name: string;
  isBreakout: string;
  published: string;
  state: string;
  startTime: string;
  endTime: string;
  participants: string;
  rawSize: string;
  metadata: RecordingMetadata;
  breakout: RecordingBreakout;
  size: string;
  playback: RecordingPlayback;
  data: any;
}

export interface GetRecordingsResponse {
  returncode: string;
  recordings: Recording[];
}

export interface GetRecordingRequest {
  meeting_id: string;
}

export interface ChannelRecordingsResponse {
  recordings: Recording[];
  total_recordings: number;
}

export const getRecordings = async (meetingId: string = ""): Promise<GetRecordingsResponse> => {
  try {
    const response = await axiosInstance.post("/api/bbb/get-recordings", {
      meeting_id: meetingId
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recordings:", error);
    throw error;
  }
};

export const getChannelRecordings = async (channelId: string): Promise<ChannelRecordingsResponse> => {
  try {
    const response = await axiosInstance.get(`/api/channels/${channelId}/recordings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching channel recordings:", error);

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;

      // If backend returns 404, treat it as "no recordings" for this channel
      if (status === 404) {
        return {
          recordings: [],
          total_recordings: 0,
        };
      }

      // For server errors, propagate a clear signal to callers
      if (status === 500) {
        throw new Error("SERVER_ERROR");
      }
    }

    throw error;
  }
};