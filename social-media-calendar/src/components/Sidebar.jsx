import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { GlobeIcon } from "lucide-react";
import ArticleIcon from "@mui/icons-material/Article";


export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <List
        sx={{
          color: "white",
          "& .MuiListItemIcon-root": {
            color: "white",
            minWidth: collapsed ? 0 : 40,
            justifyContent: "center",
          },
        }}
      >
        <SidebarItem
          icon={<DashboardIcon />}
          text="Dashboard"
          collapsed={collapsed}
          onClick={() => navigate("/")}
        />

        <SidebarItem
          icon={<GlobeIcon />}
          text="WordPress Sites"
          collapsed={collapsed}
          onClick={() => navigate("/wp-sites")}
        />

        <SidebarItem
          icon={<ArticleIcon />}
          text="WordPress Posts"
          collapsed={collapsed}
          onClick={() => navigate("/wp-posts")}
        />

        <SidebarItem
          icon={<PeopleIcon />}
          text="Clients"
          collapsed={collapsed}
          onClick={() => navigate("/clients")}
        />

        <SidebarItem
          icon={<SettingsIcon />}
          text="Settings"
          collapsed={collapsed}
          onClick={() => navigate("/settings")}
        />
      </List>
    </div>
  );
}

function SidebarItem({ icon, text, collapsed, onClick }) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 2 : 3,
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>

      {!collapsed && (
        <ListItemText
          primary={text}
          sx={{ opacity: collapsed ? 0 : 1 }}
        />
      )}
    </ListItemButton>
  );
}
