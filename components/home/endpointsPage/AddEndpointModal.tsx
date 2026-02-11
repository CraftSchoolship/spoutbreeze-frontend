import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { createStreamEndpointReq } from "@/actions/streamEndpoints";
import { StreamEndpointWithUserName } from "@/actions/streamEndpoints";

interface AddEndpointModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (fromData: createStreamEndpointReq) => void;
  onUpdate?: (id: string, fromData: createStreamEndpointReq) => void;
  isEditing?: boolean;
  currentEndpoint?: StreamEndpointWithUserName | null;
}

const AddEndpointModal: React.FC<AddEndpointModalProps> = ({
  open,
  onClose,
  onAdd,
  onUpdate,
  isEditing = false,
  currentEndpoint,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<createStreamEndpointReq>({
    title: "",
    rtmp_url: "",
    stream_key: "",
  });

  const [errors, setErrors] = useState({
    title: false,
    rtmp_url: false,
    stream_key: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is typed in
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Reset form when the modal opens or the editing state changes
  useEffect(() => {
    if (open) {
      if (isEditing && currentEndpoint) {
        setFormData({
          title: currentEndpoint.title || "",
          rtmp_url: currentEndpoint.rtmp_url || "",
          stream_key: currentEndpoint.stream_key || "",
        });
      } else {
        setFormData({
          title: "",
          rtmp_url: "",
          stream_key: "",
        });
      }
    }
  }, [open, isEditing, currentEndpoint]);

  const handleSubmit = () => {
    // Validate form
    const newErrors = {
      title: !formData.title.trim(),
      rtmp_url: !formData.rtmp_url.trim(),
      stream_key: !formData.stream_key.trim(),
    };
    setErrors(newErrors);
    // If no errors, submit form
    if (!Object.values(newErrors).some(Boolean)) {
      if (isEditing && currentEndpoint) {
        onUpdate?.(currentEndpoint.id, formData);
        handleClose();
      } else {
        onAdd(formData);
        resetForm();
      }
    }
  };

  const buttonText = isEditing ? "Update" : "Save";

  const resetForm = () => {
    setFormData({
      title: "",
      rtmp_url: "",
      stream_key: "",
    });
    setErrors({
      title: false,
      rtmp_url: false,
      stream_key: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        style: {
          borderRadius: isMobile ? "0px" : "10px",
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pt: { xs: 6, sm: 3 }, px: { xs: 2.5, sm: 3 } }}>
        <TextField
          autoFocus
          required
          margin="dense"
          id="title"
          name="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          helperText={errors.title ? "Title is required" : ""}
        />
        {/* url field */}
        <TextField
          required
          margin="dense"
          id="rtmp_url"
          name="rtmp_url"
          label="URL"
          type="text"
          fullWidth
          variant="standard"
          value={formData.rtmp_url}
          onChange={handleChange}
          error={errors.rtmp_url}
          helperText={
            errors.rtmp_url
              ? "URL is required"
              : "Paste the Server URL/RTMP URL here"
          }
        />
        {/* key field */}
        <TextField
          required
          margin="dense"
          id="stream_key"
          name="stream_key"
          label="Stream Key"
          type="text"
          fullWidth
          variant="standard"
          value={formData.stream_key}
          onChange={handleChange}
          error={errors.stream_key}
          helperText={
            errors.stream_key
              ? "Key is required"
              : "Paste the Stream Key here (keep this private)"
          }
        />
      </DialogContent>
      <DialogActions
        sx={{ px: { xs: 2.5, sm: 3 }, py: 2, display: "flex", justifyContent: "center" }}
      >
        <button
          onClick={handleSubmit}
          disabled={
            !formData.title || !formData.rtmp_url || !formData.stream_key
          }
          type="button"
          className="border px-5 py-2.5 text-[#27AAFF] rounded-[2px] cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEndpointModal;
