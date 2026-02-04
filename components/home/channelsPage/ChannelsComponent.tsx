"use client";

import React, { useState, useEffect } from "react";
import {
  fetchChannels,
  deleteChannel,
  createChannel, // Add this import
  Channels,
  CreateChannelReq,
  ChannelWithUserName,
} from "@/actions/channels";

import Image from "next/image";
import ChannelPage from "./ChannelPage";
import AddChannelModal from "./AddChannelModal";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";
import { useGlobalSnackbar } from '@/contexts/SnackbarContext';

const colorPalette = [
  "#27AAFF", // Light Blue
  "#FF092A", // Red
  "#44D500", // Green
  "#9747FF", // Purple
  "#2E27FF", // Indigo
  "#FF0099", // Pink
  "#FF8800", // Deep Orange
  "#FFC919", // Yellow
];

// Function to get a random color based on the channel ID
const getRandomColor = (id: string) => {
  // Use a more distributed hash algorithm
  const hash = id.split("").reduce((acc, char, index) => {
    // Prime multiplication helps distribute values better
    return acc + char.charCodeAt(0) * (31 ** index % 127);
  }, 0);

  // Use a larger prime number for modulo to improve distribution
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

const ChannelsComponent: React.FC = () => {
  const [channelsData, setChannelsData] = useState<Channels>({
    channels: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelWithUserName | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  const { showSnackbar } = useGlobalSnackbar();

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    const fetchChannelsData = async () => {
      try {
        setLoading(true);
        const data = await fetchChannels();
        setChannelsData(data);
        setError(null);
      } catch (error: unknown) {
        // Handle 404 error specifically (no channels found)
        if (error instanceof Error && error.message === "NO_CHANNELS_FOUND") {
          setChannelsData({ channels: [], total: 0 });
          setError(null);
          showSnackbar("No channels found", "info");
        } else {
          setError("Failed to fetch channels");
          showSnackbar("Failed to fetch channels", "error");
        }
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannelsData();
  }, [showSnackbar]);

  const handleAddChannel = async (formData: CreateChannelReq) => {
    try {
      // Actually create the channel first
      await createChannel(formData);
      
      // Then fetch the updated channels list
      const updatedData = await fetchChannels();
      setChannelsData(updatedData);
      handleCloseModal();
      showSnackbar("Channel created successfully", "success");
    } catch (error) {
      console.error("Error creating channel:", error);
      showSnackbar("Failed to create channel", "error");
    }
  };

  const confirmDeleteChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChannelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    try {
      await deleteChannel(channelToDelete);
      setChannelsData((prev) => ({
        ...prev,
        channels: prev.channels.filter((channel) => channel.id !== channelToDelete),
      }));
      showSnackbar("Channel deleted successfully", "success");
    } catch (error: unknown) {
      console.error("Error deleting channel:", error);
      showSnackbar("Failed to delete channel", "error");
    } finally {
      closeDeleteDialog();
      setChannelToDelete(null);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  const handleChannelClick = (channel: ChannelWithUserName) => {
    setSelectedChannel(channel);
  };
  const handleBackToChannels = () => {
    setSelectedChannel(null);
  };

  if (selectedChannel) {
    return (
      <ChannelPage
        channel={selectedChannel}
        onBack={handleBackToChannels}
        channelId={selectedChannel.id}
      />
    );
  }

  return (
    <section className="px-4 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10 h-screen flex flex-col">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-medium text-black">
            Channels
          </h1>
          <p className="mt-1 text-[13px] text-[#5B5D60] max-w-xl">
            This is a section where you can organize your events into different channels. Channels let you group events by topic or category.
          </p>
        </div>
        <button
          className="mt-2 sm:mt-0 mb-3.5 font-medium text-[13px] border p-2.5 text-[#27AAFF] rounded-xs cursor-pointer self-start sm:self-auto"
          onClick={handleOpenModal}
        >
          + Create a channel
        </button>
      </div>
      
      {loading && <div className="flex-1 flex items-center justify-center"><p>Loading...</p></div>}
      {error && <div className="flex-1 flex items-center justify-center"><p className="text-red-500">{error}</p></div>}
      
      {!loading && !error && channelsData.channels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Image
            src="/empty_icon.svg"
            alt="No channels"
            width={96}
            height={71}
            className="mb-4 opacity-50"
          />
          <p className="text-lg mb-2">No channels found</p>
          <p className="text-sm text-center mb-4">
            You haven&apos;t created any channel yet.
          </p>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-[#27AAFF] text-white rounded-xs font-medium hover:bg-[#2686BE] transition-colors"
          >
            Create a Channel
          </button>
        </div>
      ) : (
        !loading && !error && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {channelsData.channels.map((channel) => (
              <div
                key={channel.id}
                className="h-27.5 rounded-[10px] relative cursor-pointer"
                style={{ backgroundColor: getRandomColor(channel.id) }}
                onClick={() => handleChannelClick(channel)}
              >
                <div className="flex flex-col h-full text-white p-3.75">
                  <span className="text-lg font-semibold mb-auto">
                    {channel.name}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium">
                      Created by {channel.creator_name}
                    </span>
                    <Image
                      src="/delete_icon_outlined_white.svg"
                      alt="Delete Channel"
                      width={15}
                      height={16}
                      className="cursor-pointer"
                      onClick={(e) => confirmDeleteChannel(channel.id, e)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      
      {/* The confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Channel"
        message="Are you sure you want to delete this channel? This action cannot be undone."
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteChannel}
      />
      <AddChannelModal
        open={openModal}
        onClose={handleCloseModal}
        onAdd={handleAddChannel}
      />
    </section>
  );
};

export default ChannelsComponent;
