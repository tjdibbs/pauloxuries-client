/* eslint-disable @next/next/no-img-element */
import {
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  TextField,
  Typography,
  useTheme,
  Box,
  Container,
} from "@mui/material";
import { grey, pink } from "@mui/material/colors";
import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import Image from "next/image";

export default function Footer() {
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ email: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = (data: { email: string }) => {
    fetch("/api/subscribe", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      const res = await response.json();
      enqueueSnackbar(res.message || "Thanks for subscribing", {
        variant: res.success ? "success" : "error",
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });

      if (res.success) {
        reset({ email: "" });
      }
    });
  };

  const bgcolor = theme.palette.secondary.dark;

  return (
    <footer className="bg-primary-low/10">
      <div className="max-w-[1100px] p-4 mx-auto">
        <Box className="community" maxWidth={600}>
          <h5 className="font-extrabold text-xl mb-2">Join Our Community</h5>
          <p className="text-sm">
            Get 10% off your first order and be the first to get the latest
            updates on our promotion campaigns, products and services.
          </p>
          <form
            className="form-control my-4 flex items-center flex-wrap gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              size="small"
              variant="outlined"
              label={"Enter your email"}
              {...register("email", { required: true })}
              sx={{
                minWidth: 250,
                flexGrow: 1,
                mr: 3,
              }}
              error={Boolean(errors.email)}
            />
            <Button
              variant="contained"
              className="bg-primary-low text-white"
              size="small"
              type={"submit"}
            >
              Subscribe
            </Button>
          </form>
        </Box>
        <Divider />
        <div className="my-4 flex flex-wrap gap-4 justify-between">
          <Box width={500}>
            <Link href={"/"}>
              <img
                src={`/identity/logo.png`}
                alt="pauloxuries logo"
                style={{ height: 80 }}
              />
            </Link>
            <p className="mt-3">
              The premier e-commerce destination for men and women’s style
              combining the best brands that focus on craftsmanship and
              elegance.
            </p>
            <div className={"social-icons flex gap-x-3 items-center"}>
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
            </div>
          </Box>
          <div>
            <List>
              {links.map((link) => {
                return (
                  <Link
                    href={"/" + link.url}
                    style={{ textDecoration: "none" }}
                    passHref
                    key={link.text}
                  >
                    <ListItemButton className="rounded-lg mb-4 bg-black/5">
                      <span className="text-sm">{link.text}</span>
                    </ListItemButton>
                  </Link>
                );
              })}
            </List>
          </div>
          <div>
            <List>
              {links2.map((link) => {
                return (
                  <Link
                    href={"/" + link.url}
                    style={{ textDecoration: "none" }}
                    passHref
                    key={link.text}
                  >
                    <ListItemButton className="rounded-lg mb-4 bg-black/5">
                      <span className="text-sm">{link.text}</span>
                    </ListItemButton>
                  </Link>
                );
              })}
            </List>
          </div>
        </div>
      </div>
      <div className="text-center p-4 bg-primary-low text-white">
        <span>© 2022 PAULOXURIES</span>
      </div>
    </footer>
  );
}

const links = [
  { text: "About us", url: "about-us" },
  { text: "Shipping", url: "shipping" },
];

const links2 = [{ text: "Return & Refund Policy", url: "return_refund" }];
