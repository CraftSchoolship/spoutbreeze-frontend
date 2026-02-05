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
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
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
    <div className="px-4 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10 h-screen overflow-y-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-medium text-black">
            Endpoints
          </h1>
          <p className="mt-1 text-[13px] text-[#5B5D60] max-w-xl">
            Add the RTMP URL and stream key of the platform (for example YouTube, Twitch, or another
            RTMP service) you want to stream to (you can find them in the settings of the platform).
          </p>
        </div>
        <button
          className="mt-2 sm:mt-0 mb-[14px] font-medium text-[13px] border p-2.5 text-[#27AAFF] rounded-[2px] cursor-pointer self-start sm:self-auto"
          onClick={handleOpenModal}
        >
          + Add endpoint
        </button>
      </div>

      <TableContainer>
        <Table>
          <TableHead className="bg-[#F6F6F6]">
            <TableRow sx={{ "& th": { py: "10px", borderBottom: "none" } }}>
              <TableCell sx={{ color: "#5B5D60", fontWeight: 500 }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "#5B5D60", fontWeight: 500 }}>
                TITLE
              </TableCell>
              <TableCell sx={{ color: "#5B5D60", fontWeight: 500 }}>
                CREATED BY
              </TableCell>
              <TableCell sx={{ width: "7%" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: "15px", borderBottom: "none" }}
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: "15px", borderBottom: "none" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : streamEndpoints.length === 0 ? (
              <TableRow
                sx={{ "& td": { py: "15px", px: 0, borderBottom: "none" } }}
              >
                <TableCell colSpan={4} align="center">
                  No stream endpoints available
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              streamEndpoints.map((endpoint, index) => (
                <TableRow
                  key={endpoint.id}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#F6F6F6",
                    },
                    "& td": { py: "15px", borderBottom: "none" },
                  }}
                >
                  <TableCell>{endpoint.id.substring(0, 5)}...</TableCell>
                  <TableCell>{endpoint.title}</TableCell>
                  <TableCell>{endpoint.userName}</TableCell>
                  <TableCell>
                    <Box className="flex items-center justify-start">
                      <Image
                        src="/delete_icon_outlined.svg"
                        alt="Delete"
                        width={20}
                        height={20}
                        className="cursor-pointer mr-5"
                        onClick={() => confirmDeleteEndpoint(endpoint.id)}
                      />
                      <Image
                        src="/edit_icon_outlined.svg"
                        alt="Edit"
                        width={20}
                        height={20}
                        className="cursor-pointer"
                        onClick={() => handleEditEndpoint(endpoint.id)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
