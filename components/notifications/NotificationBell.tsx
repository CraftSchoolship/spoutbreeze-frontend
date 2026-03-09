"use client";

import React, { useCallback, useRef } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { useNotifications } from "@/contexts/NotificationContext";
import NotificationItem from "@/components/notifications/NotificationItem";

// -------------------------------------------------------------------------
// Skeleton loader for initial load
// -------------------------------------------------------------------------
const NotificationSkeleton: React.FC = () => (
  <Box sx={{ px: 2, py: 1.5 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px", flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="90%" height={14} />
          <Skeleton variant="text" width="40%" height={12} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    ))}
  </Box>
);

// -------------------------------------------------------------------------
// Empty state
// -------------------------------------------------------------------------
const EmptyState: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 6,
      px: 3,
      gap: 1,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "16px",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 1,
      }}
    >
      <NotificationsOutlinedIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />
    </Box>
    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
      All caught up!
    </Typography>
    <Typography sx={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
      You have no notifications right now.
    </Typography>
  </Box>
);

// -------------------------------------------------------------------------
// Main Bell component
// -------------------------------------------------------------------------

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    wsConnected,
    panelOpen,
    setPanelOpen,
    markRead,
    markAllRead,
    remove,
    clearAllRead,
    loadMore,
    refresh,
  } = useNotifications();

  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setPanelOpen(!panelOpen);
  };

  const handleClose = () => {
    setPanelOpen(false);
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 60 && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  const hasRead = notifications.some((n) => n.is_read);

  return (
    <>
      <Tooltip
        title={wsConnected ? "Notifications" : "Notifications (reconnecting…)"}
        placement="bottom"
      >
        <IconButton
          ref={anchorRef}
          onClick={handleToggle}
          size="medium"
          sx={{
            color: panelOpen ? "#0ea5e9" : "#64748b",
            backgroundColor: panelOpen ? "#f0f9ff" : "transparent",
            borderRadius: "10px",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "#f0f9ff",
              color: "#0ea5e9",
            },
          }}
        >
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "10px",
                fontWeight: 700,
                minWidth: "18px",
                height: "18px",
                padding: "0 4px",
                backgroundColor: "#ef4444",
              },
            }}
          >
            <NotificationsOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popper
        open={panelOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={180}>
            <div>
              <ClickAwayListener onClickAway={handleClose}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1.5,
                    width: 380,
                    maxWidth: "calc(100vw - 32px)",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: 520,
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}
                      >
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Box
                          sx={{
                            backgroundColor: "#0ea5e9",
                            color: "white",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            px: 0.9,
                            py: 0.1,
                            lineHeight: 1.6,
                          }}
                        >
                          {unreadCount}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Tooltip title="Refresh">
                        <IconButton
                          size="small"
                          onClick={refresh}
                          sx={{ color: "#94a3b8", "&:hover": { color: "#0ea5e9" } }}
                        >
                          <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                          <IconButton
                            size="small"
                            onClick={markAllRead}
                            sx={{ color: "#94a3b8", "&:hover": { color: "#0ea5e9" } }}
                          >
                            <DoneAllOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasRead && (
                        <Tooltip title="Clear read notifications">
                          <IconButton
                            size="small"
                            onClick={clearAllRead}
                            sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
                          >
                            <DeleteSweepOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Body */}
                  <Box
                    onScroll={handleScroll}
                    sx={{ overflowY: "auto", flex: 1 }}
                  >
                    {loading && notifications.length === 0 ? (
                      <NotificationSkeleton />
                    ) : notifications.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <>
                        {notifications.map((n) => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            onMarkRead={(id) => markRead([id])}
                            onDelete={remove}
                          />
                        ))}
                        {/* Load-more spinner */}
                        {loading && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              py: 1.5,
                            }}
                          >
                            <CircularProgress size={20} sx={{ color: "#0ea5e9" }} />
                          </Box>
                        )}
                        {/* Manual load-more button */}
                        {hasMore && !loading && (
                          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                            <Button
                              size="small"
                              onClick={loadMore}
                              sx={{
                                fontSize: "12px",
                                color: "#0ea5e9",
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Load more
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <>
                      <Divider sx={{ borderColor: "#f1f5f9" }} />
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: "12px", color: "#94a3b8" }}
                        >
                          {notifications.length} of {notifications.length > 0 ? (hasMore ? "many" : notifications.length) : 0} notifications
                        </Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default NotificationBell;
