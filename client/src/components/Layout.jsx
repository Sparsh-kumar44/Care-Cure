import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../AuthContext";
import ColorModeToggle from "./common/ColorModeToggle";

const W = 264;
const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardRoundedIcon /> },
  { to: "/medicines", label: "Medicines", icon: <MedicationRoundedIcon /> },
  { to: "/billing", label: "New Bill", icon: <ReceiptLongRoundedIcon /> },
  { to: "/bills", label: "Bill History", icon: <HistoryRoundedIcon /> },
  { to: "/employees", label: "Employees", icon: <BadgeRoundedIcon /> },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        background: "linear-gradient(180deg,#0b3d3b 0%,#0a2f33 100%)",
      }}
    >
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src="/logo.png"
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#fff",
            p: 0.5,
            "& img": { objectFit: "contain" },
          }}
        />
        <Box>
          <Typography fontWeight={700} lineHeight={1.2}>
            Care &amp; Cure
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            Clinic Management
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV.map((n) => (
          <ListItemButton
            key={n.to}
            component={NavLink}
            to={n.to}
            onClick={onNavigate}
            sx={{
              borderRadius: 2.5,
              mb: 0.5,
              color: "rgba(255,255,255,.72)",
              "& .MuiListItemIcon-root": { color: "inherit", minWidth: 40 },
              "&:hover": { bgcolor: "rgba(255,255,255,.07)" },
              "&.active": {
                bgcolor: "primary.main",
                color: "#fff",
                boxShadow: "0 6px 16px rgba(14,143,138,.4)",
              },
            }}
          >
            <ListItemIcon>{n.icon}</ListItemIcon>
            <ListItemText
              primary={n.label}
              primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,.1)" }} />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{ bgcolor: "primary.light", color: "#063", fontWeight: 700 }}
        >
          {(user?.name || "?")[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.name}
          </Typography>
          <Chip
            label={user?.role}
            size="small"
            sx={{
              height: 18,
              fontSize: 10.5,
              textTransform: "capitalize",
              bgcolor: "rgba(255,255,255,.14)",
              color: "#fff",
            }}
          />
        </Box>
        <Tooltip title="Log out">
          <IconButton onClick={doLogout} sx={{ color: "rgba(255,255,255,.8)" }}>
            <LogoutRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: W,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: W, border: 0 },
          }}
          open
        >
          <SidebarContent />
        </Drawer>
      ) : (
        <>
          <AppBar
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{ borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Avatar
                src="/logo.png"
                variant="rounded"
                sx={{
                  width: 30,
                  height: 30,
                  mr: 1,
                  "& img": { objectFit: "contain" },
                }}
              />
              <Typography fontWeight={700} sx={{ flex: 1 }}>
                Care &amp; Cure
              </Typography>
              <ColorModeToggle />
            </Toolbar>
          </AppBar>
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            sx={{ "& .MuiDrawer-paper": { width: W, border: 0 } }}
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: "auto" }}>
          {isDesktop && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <ColorModeToggle />
            </Box>
          )}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
