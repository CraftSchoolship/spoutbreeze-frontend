"use client";

import React, { useEffect, useState } from "react";
import { getRecordings, Recording } from "@/actions/recordings";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";
import RecordingsTable from "@/components/common/RecordingsTable";

const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showSnackbar } = useGlobalSnackbar();

  useEffect(() => {
    const fetchRecordingsData = async () => {
      try {
        const data = await getRecordings();
        setRecordings(data.recordings ?? []);
        setLoading(false);
      } catch (error) {
        console.error("Detailed error:", error);
        setError("Failed to fetch recordings");
        showSnackbar("Failed to fetch recordings", "error");
        setLoading(false);
      }
    };
    fetchRecordingsData();
  }, [showSnackbar]);

  return (
    <div className="px-10 pt-10 h-screen overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-[18px] font-medium text-black mb-[20px]">
          Recordings
        </h1>
      </div>

      <RecordingsTable
        recordings={recordings}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Recordings;
