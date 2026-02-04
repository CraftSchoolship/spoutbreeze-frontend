import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-confirmation-dialog"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "8px",
          minWidth: "360px",
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600,
        fontSize: "18px",
        color: "#0f172a",
      }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#64748b", fontSize: "14px" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          sx={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            borderRadius: "10px",
            borderColor: "#e2e8f0",
            color: "#64748b",
            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          type="submit"
          sx={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            borderRadius: "10px",
            backgroundColor: "#ef4444",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
            "&:hover": {
              backgroundColor: "#dc2626",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
            },
          }}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
