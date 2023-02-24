import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { AppState } from "@lib/types";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import { useAppDispatch } from "@lib/redux/store";
import { auth } from "@lib/redux/reducer";
import Link from "next/link";
import axios from "axios";
import router from "next/router";
import UploadIcon from "@mui/icons-material/Upload";
import { CardHeader, Typography, useTheme } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SwitchButton from "./switch";
import Cookies from "js-cookie";

export default function Navigation({ user }: { user: AppState["user"] }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [index, setIndex] = React.useState<number>(0);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setIndex(0);
  };

  console.log({ user });

  const logout = () => {
    axios.get("/logout").then((response) => {
      if (response.data === "Done") {
        dispatch(auth());
        Cookies.remove("user", { sameSite: "strict" });
        if (router.pathname.indexOf("upload") !== -1) router.replace("/");
      } else window.location.reload();
    });
  };

  return (
    <React.Fragment>
      <Box className={"menu-toggle"}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            color={"primary"}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              src={user?.image}
              sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
            >
              {user!.firstname.slice(0, 1)!.toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        MenuListProps={{
          className: "bg-primary-low/10",
        }}
        PaperProps={{
          className: "shadow-lg bg-white mt-4 w-[280px]",
          elevation: 0,
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div className="menu-header p-4 flex gap-x-4">
          <Avatar src={user!.image} />
          <div className="text">
            <span className="name text-small capitalize">
              {user!.firstname} {user!.lastname}
            </span>
            <caption className="email text-xs">{user!.email}</caption>
          </div>
        </div>
        <Divider />
        <SwipeableViews index={index} animateHeight>
          <Box>
            {/* <MenuItem onClick={() => setIndex(1)}>
              <ListItemIcon>
                <ModelTrainingIcon fontSize={"small"} />
              </ListItemIcon>
              Theme
            </MenuItem> */}
            {Boolean(user?.admin) && (
              <Link href={"/products/upload"}>
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <UploadIcon fontSize="small" />
                  </ListItemIcon>
                  Upload Products
                </MenuItem>
              </Link>
            )}
            <Link href={"/orders/"}>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <ShareLocationIcon fontSize="small" />
                </ListItemIcon>
                Track Orders
              </MenuItem>
            </Link>
            <MenuItem
              onClick={() => {
                alert("Settings page under construction");
                handleClose();
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Box>
          <Box>
            <Box
              px={1}
              position={"sticky"}
              top={0}
              zIndex={10}
              bgcolor={"secondary." + theme.palette.mode}
              onClick={() => setIndex(0)}
            >
              <IconButton sx={{ mr: 2 }}>
                <ArrowBackIosRoundedIcon fontSize={"small"} />
              </IconButton>
              <Typography variant={"subtitle2"} p={2} component={"span"}>
                Theme
              </Typography>
            </Box>
            <Box className="themes" role="list">
              {themes.map((theme, index) => {
                return (
                  <Box
                    key={index}
                    display={"flex"}
                    justifyContent={"space-between"}
                    p={2}
                    alignItems={"center"}
                  >
                    <Box sx={{ alignItems: "center", display: "flex" }}>
                      <theme.icon />
                      <Typography
                        component="span"
                        variant="subtitle2"
                        marginLeft={2}
                      >
                        {theme.label}
                      </Typography>
                    </Box>
                    <SwitchButton
                      name={theme.name as "dark" | "light" | "default"}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </SwipeableViews>
      </Menu>
    </React.Fragment>
  );
}

export const themes = [
  {
    name: "default",
    label: "System theme - Default",
    icon: AutoModeIcon,
  },
  {
    name: "light",
    label: "Light theme",
    icon: LightModeIcon,
  },
  {
    name: "dark",
    label: "Dark theme",
    icon: DarkModeIcon,
  },
];
