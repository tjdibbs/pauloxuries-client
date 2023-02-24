import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SwitchButton from "./switch";
import {
  Button,
  CardActions,
  CardHeader,
  Stack,
  SwipeableDrawer,
} from "@mui/material";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import useStyles from "@lib/styles";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import ShopRoundedIcon from "@mui/icons-material/ShopRounded";
import SwipeableViews from "react-swipeable-views";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import Avatar from "@mui/material/Avatar";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import Logout from "@mui/icons-material/Logout";
import { auth } from "@lib/redux/reducer";
import UploadIcon from "@mui/icons-material/Upload";
import { useRouter } from "next/router";
import { themes } from "./menu";
import axios from "axios";
import Cookies from "js-cookie";

interface SideBarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const navData = [
  {
    label: "Shop by",
    icon: ShopRoundedIcon,
    link: "/collections",
    submenu: [
      {
        label: "Brand",
        submenu: [
          "Louis Vuitton",
          "Gucci",
          "Jordan",
          "Reebok",
          "Nike",
          "Prada",
        ],
      },
      {
        label: "Category",
        submenu: ["Pants", "T-Shirts", "Shirts", "Shoes", "Sports Wear"],
      },
    ],
  },
];

export default function Sidebar(props: SideBarProps) {
  const theme = useTheme();
  const { open, setOpen } = props;
  const user = useAppSelector((state) => state.shop.user);
  const styles = useStyles();
  const [value, setValue] = React.useState({ title: "shop_by", index: 0 });
  const [shopValue, setShopValue] = React.useState({ index: 0, value: 0 });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logout = () => {
    axios.get("/logout").then(() => {
      dispatch(auth());
      Cookies.remove("user");
      if (router.pathname.indexOf("upload") !== -1) router.replace("/");
    });
  };

  const handleClose = (link: string) => {
    setValue({ title: "", index: 0 });
    setShopValue({ index: 0, value: 0 });
    setOpen(false);
    router.push(link);
  };

  const handleClick = () => {
    setValue({ title: "", index: 0 });
    setShopValue({ index: 0, value: 0 });
    setOpen(false);
  };

  return (
    <SwipeableDrawer
      anchor={"left"}
      open={open}
      className={"shop-sidebar"}
      onClose={handleClick}
      onOpen={() => setOpen(true)}
    >
      <Box width={300} minHeight={"100vh"} maxWidth={"100vw"}>
        {user && (
          <CardHeader
            avatar={<Avatar src={user!.image} />}
            title={
              <Typography variant="subtitle1" textTransform="capitalize">
                {user!.firstname} {user!.lastname}
              </Typography>
            }
            subheader={user!.email}
          />
        )}
        <Divider />
        <Box className={"navigation"}>
          <SwipeableViews index={value.index} animateHeight disabled>
            <Box className={"nav-page"}>
              <List>
                {user && (
                  <React.Fragment>
                    {Boolean(user?.admin) && (
                      <Link href={"/products/upload"}>
                        <ListItemButton onClick={handleClick}>
                          <ListItemIcon>
                            <UploadIcon fontSize="small" />
                          </ListItemIcon>
                          Upload Products
                        </ListItemButton>
                      </Link>
                    )}
                    <ListItemButton
                      onClick={() => {
                        handleClick();
                        router.push("/orders/");
                      }}
                    >
                      <ListItemIcon>
                        <ShareLocationIcon fontSize="small" />
                      </ListItemIcon>
                      Track Orders
                    </ListItemButton>
                  </React.Fragment>
                )}
                <ListItemButton
                  onClick={() => setValue({ title: "theme", index: 1 })}
                >
                  <ListItemIcon>
                    <ModelTrainingIcon fontSize={"small"} />
                  </ListItemIcon>
                  <ListItemText primary={"Theme"} />
                  <ArrowForwardIosRoundedIcon fontSize={"small"} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => setValue({ title: "shop_by", index: 1 })}
                >
                  <ListItemIcon>
                    <ShopRoundedIcon fontSize={"small"} />
                  </ListItemIcon>
                  <ListItemText primary={"Shop By"} />
                  <ArrowForwardIosRoundedIcon fontSize={"small"} />
                </ListItemButton>
                {user && (
                  <ListItemButton
                    onClick={() => {
                      handleClick();
                      logout();
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </ListItemButton>
                )}
              </List>
            </Box>
            <Box pb={2} className={"nav-page"}>
              <SwipeableViews index={shopValue.index} disabled animateHeight>
                <Box pb={2} className={"nav-page"} height={500}>
                  {value.title !== "theme" ? (
                    <Box>
                      <Box
                        px={1}
                        position={"sticky"}
                        top={0}
                        zIndex={10}
                        bgcolor={"secondary." + theme.palette.mode}
                        onClick={() => setValue({ title: "", index: 0 })}
                      >
                        <IconButton>
                          <ArrowBackIosRoundedIcon fontSize={"small"} />
                        </IconButton>
                        <Typography
                          variant={"subtitle2"}
                          p={2}
                          component={"span"}
                        >
                          Shop By
                        </Typography>
                      </Box>
                      <List>
                        {["Brands", "Styles"].map((title, index) => {
                          return (
                            <ListItemButton
                              key={index}
                              onClick={() =>
                                setShopValue({ index: 1, value: index })
                              }
                            >
                              <ListItemText primary={title} />
                              <ArrowForwardIosRoundedIcon fontSize={"small"} />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Box>
                  ) : (
                    <Box sx={{ position: "relative" }}>
                      <Box
                        px={1}
                        position={"sticky"}
                        top={0}
                        zIndex={10}
                        bgcolor={"secondary." + theme.palette.mode}
                        onClick={() => setValue({ index: 0, title: "theme" })}
                      >
                        <IconButton sx={{ mr: 2 }}>
                          <ArrowBackIosRoundedIcon fontSize={"small"} />
                        </IconButton>
                        <Typography
                          variant={"subtitle2"}
                          p={2}
                          component={"span"}
                        >
                          Theme
                        </Typography>
                      </Box>
                      <Box
                        className="themes"
                        role="list"
                        minHeight={"max-content"}
                      >
                        {themes.map((theme, index) => {
                          return (
                            <Box
                              key={index}
                              display={"flex"}
                              justifyContent={"space-between"}
                              p={2}
                              alignItems={"center"}
                            >
                              <Box
                                sx={{ alignItems: "center", display: "flex" }}
                              >
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
                                name={
                                  theme.name as "dark" | "light" | "default"
                                }
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
                {value.title !== "theme" ? (
                  <Box pb={2} className={"nav-page"}>
                    <Box
                      px={1}
                      position={"sticky"}
                      top={0}
                      zIndex={10}
                      bgcolor={"secondary." + theme.palette.mode}
                      onClick={() => setShopValue({ value: 0, index: 0 })}
                    >
                      <IconButton sx={{ mr: 2 }}>
                        <ArrowBackIosRoundedIcon fontSize={"small"} />
                      </IconButton>
                      <Typography
                        variant={"subtitle2"}
                        p={2}
                        component={"span"}
                      >
                        {navData[0].submenu![shopValue.value]?.label}
                      </Typography>
                    </Box>
                    <List>
                      {navData[0].submenu![shopValue.value]?.submenu?.map(
                        (title, index) => {
                          return (
                            <ListItemButton
                              key={index}
                              onClick={() =>
                                handleClose(
                                  "/collections/" +
                                    navData[0].submenu![
                                      shopValue.value
                                    ]?.label.toLowerCase() +
                                    "/" +
                                    title
                                )
                              }
                            >
                              <ListItemText primary={title} />
                            </ListItemButton>
                          );
                        }
                      )}
                    </List>
                  </Box>
                ) : (
                  <></>
                )}
              </SwipeableViews>
            </Box>
          </SwipeableViews>
        </Box>
        <Box className={styles.swiperBottom}>
          {!user && (
            <CardActions sx={{ justifyContent: "center" }}>
              <Link href={"/sign-in"}>
                <Button
                  size={"small"}
                  variant="outlined"
                  onClick={handleClick}
                  sx={{ textTransform: "none" }}
                >
                  Sign in
                </Button>
              </Link>
              <Link href={"/sign-up"}>
                <Button
                  onClick={handleClick}
                  size={"small"}
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                >
                  Sign up
                </Button>
              </Link>
            </CardActions>
          )}
          <Box className={"social-icons"}>
            <Stack direction={"row"} gap={1}>
              <IconButton>
                <FacebookRoundedIcon />
              </IconButton>
              <IconButton>
                <TwitterIcon />
              </IconButton>
              <Link href="https://instagram.com/pauloxuries">
                <IconButton>
                  <InstagramIcon />
                </IconButton>
              </Link>
            </Stack>
          </Box>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
