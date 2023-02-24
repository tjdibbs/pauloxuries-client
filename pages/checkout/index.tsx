import React from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import ShippingSummary from "@comp/checkout/summary";
import Information from "@comp/checkout/information";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import Cookie from "js-cookie";
import { AppState, Cart, CartProduct } from "@lib/types";
import { GetServerSideProps } from "next";
import { getUser } from "../../server/routes/router";
import FetchCartsHook from "@comp/fetchCartsHook";
import Cookies from "cookies";
import SEO from "@comp/seo";

const pageDescription = {
  title: `Checkout Product`,
  description: "Checkout your product for shipping and delivering",
  url: "https://pauloxuries.com/checkout",
  image: "https://pauloxuries.com/identity/dark-logo.png",
};

const Checkout: React.FC<{ user: AppState["user"] }> = ({ user }) => {
  const theme = useTheme();
  const [checkout, setCheckout] = React.useState<Cart<CartProduct> | null>(
    null
  );
  const [done, setDone] = React.useState<boolean>(false);

  FetchCartsHook({ user, loading: false, setLoading: () => null });

  React.useEffect(() => {
    const checkoutCookie = Cookie.get("checkout");
    const checkout: Cart<CartProduct> = checkoutCookie
      ? JSON.parse(checkoutCookie)
      : null;

    setCheckout(checkout);
  }, []);

  return (
    <React.Fragment>
      <SEO {...pageDescription} />
      {!done ? (
        <Container maxWidth={"xl"} sx={{ mb: 10, p: 0 }} className="component-wrap">
          <Box className={"breadcrumbs-wrapper"} my={3}>
            <Breadcrumbs
              separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
            >
              <Link href={"/"}>
                <Typography sx={{ cursor: "pointer" }} variant={"subtitle2"}>
                  Home
                </Typography>
              </Link>
              <Typography variant={"subtitle2"}>Checkout</Typography>
              <Typography variant={"subtitle2"}>information</Typography>
            </Breadcrumbs>
          </Box>
          <Box
            className={"wrapper"}
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column-reverse", md: "row" },
            }}
          >
            <Information
              checkout={checkout}
              setCheckout={setCheckout}
              setDone={setDone}
            />
            <ShippingSummary checkout={checkout} />
          </Box>
        </Container>
      ) : (
        <Card
        className="component-wrap"
          elevation={3}
          sx={{
            borderRadius: "20px",
            px: 2,
            py: 6,
            mt: 3,
            textAlign: "center",
            display: "block",
            gap: 1,
            bgcolor: `secondary.${theme.palette.mode}`,
          }}
        >
          <Divider textAlign={"center"}>
            <Typography variant={"h6"} color="#318b31" fontWeight={700}>
              Order Complete
            </Typography>
          </Divider>
          <Typography variant={"subtitle2"} component={"div"}>
            Thanks from choosing from pauloxuries store.
          </Typography>
          <Box>
            <Chip
              component={"div"}
              variant="outlined"
              sx={{ my: 1, mx: "auto" }}
              label={<b>Further details we be sent to your email.</b>}
            />
          </Box>
          <Link href={"/orders"}>
            <Button variant="contained">Track Orders</Button>
          </Link>
        </Card>
      )}
    </React.Fragment>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx;
  // @ts-ignore
  const user = req.session.user ?? null;
  const cookie = new Cookies(req, res);

  if (user && !user?.verified) {
    await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        firstname: user.firstname,
        type: "sign-up",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    cookie.set(
      "request_verification",
      JSON.stringify({
        email: user.email,
        firstname: user.firstname,
      }),
      {
        httpOnly: false,
      }
    );

    return {
      redirect: {
        permanent: true,
        destination: "/email/request-verification?redirect=/checkout",
      },
    };
  }

  return {
    props: {
      user,
    },
  };
};

export default Checkout;

// export default dynamic(async () => await Checkout, { ssr: false });
