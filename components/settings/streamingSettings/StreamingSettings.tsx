"use client";

import React, { useEffect, useState } from "react";
import { getUserResolution, updateUserResolution } from "@/actions/resolution";
import axios from "@/lib/axios";
import {
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";

type Resolution = "720p" | "1080p" | "1440p" | "4K";

const RESOLUTION_ORDER: Resolution[] = ["720p", "1080p", "1440p", "4K"];

// Helper function to get allowed resolutions based on max_quality
const getAllowedResolutions = (maxQuality: Resolution): Resolution[] => {
  const maxIndex = RESOLUTION_ORDER.indexOf(maxQuality);
  if (maxIndex === -1) return ["720p"];
  return RESOLUTION_ORDER.slice(0, maxIndex + 1);
};

const StreamingSettings: React.FC = () => {
  const [maxQuality, setMaxQuality] = useState<Resolution>("720p");
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useGlobalSnackbar();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch plan limits
        const limitsRes = await axios.get("/api/payments/limits");
        const planMax = limitsRes.data?.max_quality || "720p";
        setMaxQuality(planMax);

        // Fetch current resolution setting
        const resolutionResult = await getUserResolution();
        console.log("Fetched resolution:", resolutionResult);

        if (
          resolutionResult.success &&
          resolutionResult.data?.default_resolution
        ) {
          const userDefault = resolutionResult.data.default_resolution as Resolution;
          // Ensure user's default doesn't exceed current plan max
          const allowed = getAllowedResolutions(planMax);
          setResolution(allowed.includes(userDefault) ? userDefault : planMax);
        } else {
          // No default set, use plan max
          setResolution(planMax);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showSnackbar("Failed to load streaming settings", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [showSnackbar]);

  const handleSaveResolution = async () => {
    try {
      setSaving(true);
      console.log("Saving resolution:", resolution);
      const result = await updateUserResolution(resolution);

      if (result.success) {
        showSnackbar("Default resolution saved successfully", "success");
      } else {
        showSnackbar(result.error || "Failed to save resolution", "error");
      }
    } catch (error) {
      console.error("Failed to save resolution:", error);
      showSnackbar("Failed to save resolution", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResolutionChange = (event: SelectChangeEvent) => {
    const newResolution = event.target.value as Resolution;
    console.log("Resolution changed to:", newResolution);
    setResolution(newResolution);
  };

  const allowedResolutions = getAllowedResolutions(maxQuality);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <CircularProgress size={32} sx={{ color: "#0ea5e9" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Streaming Settings
        </h2>
        <p className="text-sm text-slate-600">
          Choose your preferred streaming resolution from the options available in your plan.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Default Stream Resolution
            </h3>
            <p className="text-sm text-slate-600">
              This resolution will be used when creating new events.
            </p>
          </div>

          <FormControl fullWidth>
            <InputLabel id="resolution-select-label">Resolution</InputLabel>
            <Select
              labelId="resolution-select-label"
              id="resolution-select"
              value={resolution}
              label="Resolution"
              onChange={handleResolutionChange}
              sx={{
                borderRadius: "10px",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0ea5e9",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0ea5e9",
                },
              }}
            >
              {allowedResolutions.map((res) => (
                <MenuItem key={res} value={res}>
                  {res}
                </MenuItem>
              ))}
            </Select>
            <p className="text-xs text-slate-500 mt-2">
              Your plan maximum: {maxQuality}
            </p>
          </FormControl>

          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            Select your preferred resolution. You can choose any resolution up to your plan&apos;s maximum ({maxQuality}).
          </Alert>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            onClick={handleSaveResolution}
            disabled={saving}
            variant="contained"
            sx={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #0284c7 0%, #0891b2 100%)",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
              },
              "&:disabled": {
                background: "#cbd5e1",
                color: "#fff",
              },
            }}
          >
            {saving ? (
              <>
                <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StreamingSettings;