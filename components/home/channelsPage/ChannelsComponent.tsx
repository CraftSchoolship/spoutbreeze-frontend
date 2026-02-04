"use client";

import React, { useState, useEffect } from "react";
import {
  fetchChannels,
  deleteChannel,
  createChannel,
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
  "#0ea5e9", // Sky Blue
  "#06b6d4", // Teal
  "#14b8a6", // Teal darker
  "#0284c7", // Sky Blue darker
  "#0891b2", // Cyan
  "#0d9488", // Teal accent
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
];

const getRandomColor = (id: string) => {
  const hash = id.split("").reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (31 ** index % 127);
  }, 0);

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
      await createChannel(formData);
      
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
    <section className="px-6 py-8 sm:px-8 lg:px-10 h-screen flex flex-col">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Channels
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl leading-relaxed">
            Organize your events into different channels. Channels let you group events by topic or category.
          </p>
        </div>
        <button
          className="mt-2 sm:mt-0 font-semibold text-sm px-5 py-2.5 text-white rounded-xl cursor-pointer self-start sm:self-auto transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
            boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
          }}
          onClick={handleOpenModal}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(14, 165, 233, 0.3)";
          }}
        >
          + Create Channel
        </button>
      </div>
      
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {error && <div className="flex-1 flex items-center justify-center"><p className="text-red-500">{error}</p></div>}
      
      {!loading && !error && channelsData.channels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Image
            src="/empty_icon.svg"
            alt="No channels"
            width={96}
            height={71}
            className="mb-4 opacity-40"
          />
          <p className="text-lg mb-2 text-slate-600">No channels found</p>
          <p className="text-sm text-center mb-6 text-slate-400">
            You haven&apos;t created any channel yet.
          </p>
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
            }}
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
                className="h-28 rounded-2xl relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${getRandomColor(channel.id)} 0%, ${getRandomColor(channel.id)}cc 100%)`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onClick={() => handleChannelClick(channel)}
              >
                <div className="flex flex-col h-full text-white p-4">
                  <span className="text-lg font-semibold mb-auto">
                    {channel.name}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium opacity-90">
                      Created by {channel.creator_name}
                    </span>
                    <Image
                      src="/delete_icon_outlined_white.svg"
                      alt="Delete Channel"
                      width={15}
                      height={16}
                      className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                      onClick={(e) => confirmDeleteChannel(channel.id, e)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      
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
