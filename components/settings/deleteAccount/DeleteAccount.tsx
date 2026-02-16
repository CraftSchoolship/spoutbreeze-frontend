import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { deleteAccount } from "@/actions/deleteAccount";
import { useGlobalSnackbar } from "@/contexts/SnackbarContext";

const CONFIRMATION_PHRASE = "DELETE";

const DeleteAccount: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useGlobalSnackbar();

  const handleContinue = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setOpen(false);
    setConfirmation("");
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (confirmation !== CONFIRMATION_PHRASE) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAccount();
      // The deleteAccount action handles redirect to home
    } catch (err) {
      setIsDeleting(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete account. Please try again or contact support.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  const isConfirmationValid = confirmation === CONFIRMATION_PHRASE;

  return (
    <Box className="p-4 md:py-10 md:pl-10">
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Delete Account
      </Typography>

      <Box className="w-full md:w-1/2">
        <Typography variant="body1" className="mb-6 text-gray-700 leading-relaxed">
          Permanently deleting your account will remove all your data, your profile,
          your channels, and any uploaded recordings. This action is irreversible,
          and you won&apos;t be able to recover your account or any associated information.
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleContinue}
          sx={{ textTransform: 'none', mt: 2 }}
        >
          Continue
        </Button>
      </Box>

      {/* Confirmation Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" sx={{ mb: 2 }}>
            This action is <strong>permanent and irreversible</strong>. All your data,
            channels, recordings, and subscription will be deleted.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To confirm, type <strong>{CONFIRMATION_PHRASE}</strong> in the field below:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={`Type "${CONFIRMATION_PHRASE}" to confirm`}
            fullWidth
            variant="outlined"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={isDeleting}
            error={confirmation.length > 0 && !isConfirmationValid}
            helperText={
              confirmation.length > 0 && !isConfirmationValid
                ? `Please type "${CONFIRMATION_PHRASE}" exactly`
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={!isConfirmationValid || isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteAccount;