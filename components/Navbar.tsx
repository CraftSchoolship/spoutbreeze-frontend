"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { getLoginUrl } from "@/lib/auth";
import { User, fetchCurrentUser, getPrimaryRole } from "@/actions/fetchUsers";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { stringToColor } from "@/utils/userAvatarColor";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { logout } from "@/actions/logout";

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 40,
      height: 40,
      fontSize: '14px',
      fontWeight: 600,
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

const handleLogin = async () => {
  window.location.href = await getLoginUrl();
};

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogoutClick = async () => {
    setLogoutLoading(true);
    setAnchorEl(null);

    try {
      setUser(null);
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      window.location.href = "/";
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    setAnchorEl(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (
        pathname.includes("/auth/") ||
        pathname.includes("/join/") ||
        pathname === "/"
      ) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, searchParams, router]);

  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-8 lg:px-24 py-4 glass-effect z-50 border-b border-slate-100">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative">
          <Image
            src="/bluescale_logo.png"
            alt="BlueScale"
            width={44}
            height={44}
            className="object-contain transition-transform group-hover:scale-105"
            priority
          />
        </div>
        <span className="text-xl font-bold text-slate-800 hidden sm:block">
          Blue<span className="text-sky-500">Scale</span>
        </span>
      </Link>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <Box
            sx={{ 
              width: 100, 
              height: 40, 
              bgcolor: "#f1f5f9", 
              borderRadius: 2,
              animation: 'pulse 2s infinite',
            }}
          />
        ) : user ? (
          <>
            <Stack
              direction="row"
              spacing={1.5}
              className="items-center"
              onClick={handleClick}
              sx={{
                cursor: "pointer",
                padding: '6px 12px',
                borderRadius: '12px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              }}
            >
              <Avatar
                {...stringAvatar(`${user.first_name} ${user.last_name}`)}
              />
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-medium text-slate-700">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs text-slate-400">
                  {getPrimaryRole(user)}
                </span>
              </div>
            </Stack>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                list: {
                  sx: {
                    padding: 0,
                    margin: 0,
                  },
                },
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    mt: 1.5,
                    minWidth: "260px",
                    borderRadius: "16px",
                    border: '1px solid #e2e8f0',
                    "& .MuiAvatar-root": {
                      width: 44,
                      height: 44,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 20,
                      width: 12,
                      height: 12,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ p: 2, pb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    {...stringAvatar(`${user.first_name} ${user.last_name}`)}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
                      {user.first_name} {user.last_name}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: '#64748b' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ borderColor: '#f1f5f9' }} />

              <MenuItem
                onClick={handleSettingsClick}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&:hover': { backgroundColor: '#f8fafc' },
                }}
              >
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
                </ListItemIcon>
                <span className="text-slate-600">Settings</span>
              </MenuItem>
              <MenuItem
                onClick={handleLogoutClick}
                disabled={logoutLoading}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&:hover': { backgroundColor: '#fef2f2' },
                }}
              >
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                <span className="text-red-500">
                  {logoutLoading ? "Signing out..." : "Sign out"}
                </span>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
              },
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
