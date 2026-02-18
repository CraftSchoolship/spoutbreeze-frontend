import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  CircularProgress,
  Button,
  Alert,
  Snackbar
} from "@mui/material";
import { fetchCurrentUser, User, getPrimaryRole } from "@/actions/fetchUsers";
import { updateUserProfile, UpdateProfileRequest } from "@/actions/updateProfile";

const AccountInfo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
        if (userData) {
          setFormData({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email
          });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.length > 50) {
      newErrors.first_name = "First name must be 50 characters or less";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.length > 50) {
      newErrors.last_name = "Last name must be 50 characters or less";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 50) {
      newErrors.email = "Email must be 50 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.first_name !== user.first_name ||
      formData.last_name !== user.last_name ||
      formData.email !== user.email
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setSnackbar({
        open: true,
        message: "No changes to save",
        severity: "error"
      });
      return;
    }

    setUpdating(true);

    try {
      const updateData: UpdateProfileRequest = {};

      if (formData.first_name !== user?.first_name) {
        updateData.first_name = formData.first_name.trim();
      }
      if (formData.last_name !== user?.last_name) {
        updateData.last_name = formData.last_name.trim();
      }
      if (formData.email !== user?.email) {
        updateData.email = formData.email.trim().toLowerCase();
      }

      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success"
      });
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      let errorMessage = "Failed to update profile";

      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      });
      setErrors({});
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box className="p-4 md:py-10 md:pl-10">
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Account Info
        </Typography>
        <Box className="flex justify-center mt-4">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="p-4 md:py-10 md:pl-10">
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Account Info
      </Typography>
      <Typography variant="body1" className="text-gray-600 pb-5">
        Manage your account preferences and profile information.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
        <TextField
          label="First Name"
          value={formData.first_name}
          onChange={handleInputChange("first_name")}
          variant="outlined"
          fullWidth
          error={!!errors.first_name}
          helperText={errors.first_name}
          disabled={updating}
        />

        <TextField
          label="Last Name"
          value={formData.last_name}
          onChange={handleInputChange("last_name")}
          variant="outlined"
          fullWidth
          error={!!errors.last_name}
          helperText={errors.last_name}
          disabled={updating}
        />

        <TextField
          label="Email"
          value={formData.email}
          onChange={handleInputChange("email")}
          variant="outlined"
          fullWidth
          error={!!errors.email}
          helperText={errors.email}
          disabled={updating}
        />

        <TextField
          label="Role"
          value={user ? getPrimaryRole(user) : ""}
          variant="outlined"
          fullWidth
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', maxWidth: '400px' }}>
        <Button
          variant="contained"
          onClick={handleCancel}
          disabled={updating}
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
        <Button
          variant="outlined"
          onClick={handleSave}
          disabled={updating}
          sx={{
            padding: "10px",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            color: "#27AAFF",
            borderColor: "#27AAFF",
          }}
        >
          {updating ? "Updating..." : "Update"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountInfo;
