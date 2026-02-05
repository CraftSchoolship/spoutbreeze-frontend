import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Image from "next/image";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { formatTime, formatDate } from "@/utils/dateTimeFormatter";
import { Events } from "@/actions/events";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";
import JoinUrlDialog from "./JoinUrlDialog";

import LiveBadge from "@/components/common/LiveBadge";

interface EventListProps {
  loading: boolean;
  error: string | null;
  eventsData: Events;
  eventMenuItems: Array<{ key: string; label: string; icon: string }>;
  handleClick: (event: React.MouseEvent<HTMLElement>, eventId: string) => void;
  handleClose: () => void;
  menuState: {
    anchorEl: HTMLElement | null;
    eventId: string | null;
  };
  handleStartEvent: (eventId: string) => void;
  handleDeleteEvent: (eventId: string) => void;
  handleEditEvent: (eventId: string) => void;
  handleGetJoinUrl: (eventId: string) => Promise<void>;
}

const EventList: React.FC<EventListProps> = ({
  loading,
  error,
  eventsData,
  eventMenuItems,
  handleClick,
  handleClose,
  menuState,
  handleStartEvent,
  handleDeleteEvent,
  handleEditEvent,
}) => {
  const open = Boolean(menuState.anchorEl);
  const { showSnackbar } = useGlobalSnackbar();

  const [urlDialog, setUrlDialog] = React.useState({
    open: false,
    eventId: "",
    eventTitle: "",
  });

  const handleCopyLink = async (eventId: string) => {
    try {
      const event = eventsData.events.find((e) => e.id === eventId);
      setUrlDialog({
        open: true,
        eventId: eventId,
        eventTitle: event?.title || "Event",
      });
    } catch (error) {
      console.error("Error preparing join URLs:", error);
      showSnackbar("Failed to prepare join URLs. Please try again.", "error");
    }
  };

  const handleCloseUrlDialog = () => {
    setUrlDialog({ open: false, eventId: "", eventTitle: "" });
  };

  return (
    <div className="flex flex-col">
      {loading ? (
        <p className="text-center py-4 text-slate-500">Loading events...</p>
      ) : error ? (
        <p className="text-center py-4 text-red-500">{error}</p>
      ) : (
        <div className="overflow-y-auto">
          {eventsData.events.map((event, index) => (
            <List key={event.id} disablePadding>
              <ListItem
                disablePadding
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 1.5,
                  py: 1.5,
                }}
              >
                <ListItemText
                  sx={{ flex: 1, minWidth: 0 }}
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="font-medium text-[15px] sm:text-[17px] md:text-[18px] truncate max-w-full text-slate-800">
                        {event.title}
                      </span>
                      <LiveBadge show={event.status === "live"} variant="pulse" />
                    </Box>
                  }
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: { xs: "14px", sm: "16px", md: "18px" },
                        fontWeight: 500,
                      },
                    },
                    secondary: {
                      component: "div",
                    },
                  }}
                  secondary={
                    <React.Fragment>
                      <Box
                        component="span"
                        mt={0.5}
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: { xs: "flex-start", sm: "center" },
                          gap: { xs: 0.5, sm: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Image
                            src="/events/agenda_icon.svg"
                            alt="agenda"
                            width={15}
                            height={15}
                          />
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: "#64748b" }}
                          >
                            {formatDate(event.start_date)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Image
                            src="/events/clock_icon.svg"
                            alt="clock"
                            width={15}
                            height={15}
                          />
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: "#64748b" }}
                          >
                            {formatTime(event.start_time)}
                          </Typography>
                        </Box>
                      </Box>
                    </React.Fragment>
                  }
                />

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end sm:flex-nowrap ml-2">
                  {event.status !== "ended" && (
                    <button
                      onClick={() => handleCopyLink(event.id)}
                      className="flex items-center text-sky-500 font-medium text-[12px] sm:text-[13px] cursor-pointer sm:mr-[15px] whitespace-nowrap hover:text-sky-600 transition-colors"
                    >
                      <Image
                        src="/events/link_icon.svg"
                        alt="copy link"
                        width={15}
                        height={15}
                        className="mr-[5px]"
                      />
                      Copy Link
                    </button>
                  )}
                  <button
                    id="event-menu"
                    aria-controls={open ? "event-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={(e) => handleClick(e, event.id)}
                    className="flex text-slate-400 hover:text-slate-600 font-medium text-[13px] cursor-pointer transition-colors"
                  >
                    <MoreVertIcon className="mr-[5px]" />
                  </button>
                  <Menu
                    id={`event-menu-${event.id}`}
                    anchorEl={menuState.anchorEl}
                    open={open && menuState.eventId === event.id}
                    onClose={handleClose}
                    slotProps={{
                      list: {
                        "aria-labelledby": "basic-button",
                        sx: {
                          padding: 0,
                          margin: 0,
                        },
                      },
                      paper: {
                        sx: {
                          borderRadius: "12px",
                          minWidth: "140px",
                          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e2e8f0",
                          padding: 0,
                        },
                      },
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    {eventMenuItems
                      .filter((item) => {
                        if (item.key === "start" && event.status === "ended") {
                          return false;
                        }
                        return true;
                      })
                      .map((item) => (
                        <MenuItem
                          key={item.key}
                          onClick={() => {
                            if (item.key === "start") {
                              if (menuState.eventId) {
                                handleStartEvent(menuState.eventId);
                              }
                            } else if (item.key === "share") {
                              if (menuState.eventId) {
                                handleCopyLink(menuState.eventId);
                              }
                            } else if (item.key === "delete") {
                              if (menuState.eventId) {
                                handleDeleteEvent(menuState.eventId);
                              }
                            } else if (item.key === "edit") {
                              if (menuState.eventId) {
                                handleEditEvent(menuState.eventId);
                              }
                            }
                            handleClose();
                          }}
                          sx={{
                            padding: "12px 16px",
                            "&:hover": {
                              backgroundColor: "rgba(14, 165, 233, 0.04)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              src={item.icon}
                              alt={item.label}
                              width={14}
                              height={14}
                              className="mr-2 opacity-60"
                            />
                            <span className="text-slate-600 text-sm">{item.label}</span>
                          </Box>
                        </MenuItem>
                      ))}
                  </Menu>
                </div>
              </ListItem>
              {index < eventsData.events.length - 1 && (
                <Divider sx={{ marginY: "12px", borderColor: "#f1f5f9" }} />
              )}
            </List>
          ))}
        </div>
      )}

      <JoinUrlDialog
        open={urlDialog.open}
        onClose={handleCloseUrlDialog}
        eventId={urlDialog.eventId}
        eventTitle={urlDialog.eventTitle}
      />
    </div>
  );
};

export default EventList;
