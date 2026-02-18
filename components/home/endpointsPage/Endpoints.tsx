"use client";

import React, { useEffect, useState } from "react";
import {
  fetchStreamEndpoints,
  StreamEndpointWithUserName,
  createStreamEndpoint,
  createStreamEndpointReq,
  deleteStreamEndpoint,
  updateStreamEndpoint,
} from "@/actions/streamEndpoints";

import Image from "next/image";
import AddEndpointModal from "./AddEndpointModal";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";

const Endpoints: React.FC = () => {
  const [streamEndpoints, setStreamEndpoints] = React.useState<
    StreamEndpointWithUserName[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] =
    useState<StreamEndpointWithUserName | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endpointToDelete, setEndpointToDelete] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const { showSnackbar } = useGlobalSnackbar();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditing(false);
    setCurrentEndpoint(null);
  };

  const handleAddEndpoint = async (formData: createStreamEndpointReq) => {
    try {
      await createStreamEndpoint(formData);

      // Refresh the endpoints list
      const data = await fetchStreamEndpoints();
      setStreamEndpoints(data);

      handleCloseModal();
      showSnackbar("Endpoint created successfully", "success");
    } catch (error) {
      console.error("Error creating endpoint:", error);
      showSnackbar("Failed to create endpoint", "error");
    }
  };

  useEffect(() => {
    const fetchStreamEndpointsData = async () => {
      try {
        const data = await fetchStreamEndpoints();
        setStreamEndpoints(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stream endpoints:", err);
        setError("Failed to load endpoints");
        setLoading(false);
        showSnackbar("Failed to load endpoints", "error");
      }
    };

    fetchStreamEndpointsData();
  }, [showSnackbar]); // Add showSnackbar to the dependency array

  const confirmDeleteEndpoint = (id: string) => {
    setEndpointToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEndpoint = async () => {
    if (!endpointToDelete) return;

    try {
      await deleteStreamEndpoint(endpointToDelete);
      setStreamEndpoints((prev) =>
        prev.filter((endpoint) => endpoint.id !== endpointToDelete)
      );
      showSnackbar("Endpoint deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      showSnackbar("Failed to delete endpoint", "error");
    } finally {
      closeDeleteDialog();
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEndpointToDelete(null);
  };

  const handleUpdateEndpoint = async (
    id: string,
    formData: createStreamEndpointReq
  ) => {
    try {
      await updateStreamEndpoint(id, formData);

      // Update the local state with user name preserved
      const updatedEndpoints = streamEndpoints.map((endpoint) =>
        endpoint.id === id
          ? { ...endpoint, ...formData, userName: endpoint.userName }
          : endpoint
      );
      setStreamEndpoints(updatedEndpoints);

      handleCloseModal();
      showSnackbar("Endpoint updated successfully", "success");
    } catch (error) {
      console.error("Error updating endpoint:", error);
      showSnackbar("Failed to update endpoint", "error");
    }
  };

  const handleEditEndpoint = (id: string) => {
    const endpointToEdit = streamEndpoints.find(
      (endpoint) => endpoint.id === id
    );
    if (endpointToEdit) {
      setCurrentEndpoint(endpointToEdit);
      setIsEditing(true);
      setOpenModal(true);
    }
  };

  return (
    <div className="px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-base sm:text-lg font-medium text-black">
            Endpoints
          </h1>
          <div className="mt-2 text-xs sm:text-[13px] text-[#5B5D60] max-w-3xl leading-relaxed space-y-4">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-[#27AAFF] flex items-center gap-1.5 hover:underline font-medium focus:outline-none cursor-pointer"
            >
              <span className="text-lg leading-none">{showHelp ? "−" : "+"}</span>
              {showHelp
                ? "Hide instructions"
                : "Need help finding your RTMP URL and Stream Key?"}
            </button>

            {showHelp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                {/* YouTube Guide */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start group hover:border-red-200 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      YouTube Live
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      Go to <strong>YouTube Studio</strong> → click{" "}
                      <strong>Go Live</strong> (top right) → copy from{" "}
                      <strong>Stream Settings</strong>.
                    </p>
                    <a
                      href="https://studio.youtube.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      Open YouTube Studio →
                    </a>
                  </div>
                </div>

                {/* Twitch Guide */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 items-start group hover:border-purple-200 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Twitch
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      <strong>Stream Key:</strong> Dashboard → Settings → Stream.
                      <br />
                      <strong>RTMP URL:</strong> Use a localized ingest server.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <a
                        href="https://dashboard.twitch.tv/settings/stream"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        Get Stream Key →
                      </a>
                      <a
                        href="https://help.twitch.tv/s/twitch-ingest-recommendation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        Get RTMP URL (Ingest) →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className="mt-2 sm:mt-0 shrink-0 font-medium text-xs sm:text-[13px] border p-2 sm:p-2.5 text-[#27AAFF] rounded-[2px] cursor-pointer self-start sm:self-auto"
          onClick={handleOpenModal}
        >
          + Add endpoint
        </button>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && streamEndpoints.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-sm">No stream endpoints available</p>
        </div>
      )}

      {/* ── Endpoint Cards ── */}
      {!loading && !error && streamEndpoints.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streamEndpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-800 truncate">
                  {endpoint.title}
                </h3>
                <div className="flex items-center gap-3 shrink-0">
                  <Image
                    src="/edit_icon_outlined.svg"
                    alt="Edit"
                    width={18}
                    height={18}
                    className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => handleEditEndpoint(endpoint.id)}
                  />
                  <Image
                    src="/delete_icon_outlined.svg"
                    alt="Delete"
                    width={18}
                    height={18}
                    className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => confirmDeleteEndpoint(endpoint.id)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ID: {endpoint.id.substring(0, 8)}...</span>
                <span className="text-slate-500">{endpoint.userName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Endpoint"
        message="Are you sure you want to delete this endpoint? This action cannot be undone."
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteEndpoint}
      />

      <AddEndpointModal
        open={openModal}
        onClose={handleCloseModal}
        onAdd={handleAddEndpoint}
        onUpdate={handleUpdateEndpoint}
        isEditing={isEditing}
        currentEndpoint={currentEndpoint}
      />
    </div>
  );
};

export default Endpoints;
