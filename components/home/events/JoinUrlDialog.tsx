import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import { getShareableJoinUrl } from "@/utils/joinUrl";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";

interface JoinUrlDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string; // Change from joinUrls to eventId
  eventTitle: string;
}

const JoinUrlDialog: React.FC<JoinUrlDialogProps> = ({
  open,
  onClose,
  eventId, // Change from joinUrls to eventId
  eventTitle,
}) => {
  const { showSnackbar } = useGlobalSnackbar();

  const handleCopyUrl = async (role: 'attendee' | 'moderator') => {
    try {
      const shareableUrl = getShareableJoinUrl(eventId, role);
      await navigator.clipboard.writeText(shareableUrl);
      showSnackbar(`${role === 'moderator' ? 'Moderator' : 'Attendee'} URL copied to clipboard!`, "success");
      onClose();
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      showSnackbar("Failed to copy URL to clipboard.", "error");
    }
  };

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = (platform: "whatsapp" | "email", role: "attendee" | "moderator") => {
    try {
      const url = getShareableJoinUrl(eventId, role);
      const baseMessage = `Join "${eventTitle}" on Spoutbreeze:`;
      const text = `${baseMessage} ${url}`;

      let shareUrl = "";

      if (platform === "whatsapp") {
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      } else if (platform === "email") {
        const subject = `Join ${eventTitle}`;
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      }

      if (shareUrl) {
        openShareWindow(shareUrl);
      }
    } catch (error) {
      console.error("Error opening share dialog:", error);
      showSnackbar("Failed to open share options.", "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "18px",
        }}
      >
        Share Event - {eventTitle}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: "#F7F9FC",
            border: "1px solid #E0E7FF",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Quick share (attendee link)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Share the attendee join link directly via your favorite app.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<WhatsAppIcon />}
              sx={{ textTransform: "none", bgcolor: "#25D366", "&:hover": { bgcolor: "#1DA955" } }}
              onClick={() => handleShare("whatsapp", "attendee")}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EmailIcon />}
              sx={{ textTransform: "none" }}
              onClick={() => handleShare("email", "attendee")}
            >
              Email
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Or copy the links manually:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Attendee URL */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #E0E7FF",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Attendee Link
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              For participants joining the event
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="text"
                value={getShareableJoinUrl(eventId, 'attendee')}
                readOnly
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #27AAFF",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleCopyUrl('attendee')}
                style={{
                  padding: "8px",
                  border: "1px solid #27AAFF",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#27AAFF",
                }}
              >
                <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Box>
          </Box>

          {/* Moderator URL */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #E0E7FF",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Moderator Link
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              For hosts with control permissions
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="text"
                value={getShareableJoinUrl(eventId, 'moderator')}
                readOnly
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #27AAFF",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleCopyUrl('moderator')}
                style={{
                  padding: "8px",
                  border: "1px solid #27AAFF",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#27AAFF",
                }}
              >
                <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            padding: "10px",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            backgroundColor: "#CCCCCC",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#CCCCCC",
              boxShadow: "none",
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinUrlDialog;