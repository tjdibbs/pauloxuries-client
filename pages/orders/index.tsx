/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowForwardIosRounded } from "@mui/icons-material";
import {
  Container,
  Typography,
  Breadcrumbs,
  Box,
  Card,
  Skeleton,
  Button,
} from "@mui/material";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import { getUser } from "../../server/routes/router";
import axios from "axios";
import { AppState } from "@lib/types";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { auth } from "@lib/redux/reducer";
import Order, { Prop as OrderType } from "@comp/order";
import SEO from "@comp/seo";

interface Props {
  user: AppState["user"];
}

export default function Orders(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const { carts, user } = useAppSelector((state) => state.shop);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = React.useState<OrderType[] | null>(null);

  React.useEffect(() => {
    if (props.user) {
      dispatch(auth(props.user));
      axios
        .post("/api/orders/" + props.user.id)
        .then((response) => {
          if (response.data.success) {
            setOrders(response.data.orders);
          } else throw new Error(response.data.message);
          setLoading(false);
        })
        .catch((e) => {
          enqueueSnackbar(e.message ?? "Connection Problem", {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, dispatch]);

  const pageDescription = {
    title: `Orders`,
    description: "Track and Cancel your pending and completed order",
    url: "https://pauloxuries.com/orders",
    image: "https://pauloxuries.com/identity/dark-logo.png",
  };

  return (
    <Container maxWidth={"xl"} sx={{ p: 0 }} className="component-wrap">
      <SEO {...pageDescription} />
      <Box className={"breadcrumbs-wrapper"} my={3}>
        <Breadcrumbs
          separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
        >
          <Link href={"/"}>
            <Typography sx={{ cursor: "pointer" }} variant={"subtitle2"}>
              Home
            </Typography>
          </Link>
          <Typography variant={"subtitle2"}>Orders</Typography>
          <Typography variant={"subtitle2"}>{props.user?.firstname}</Typography>
        </Breadcrumbs>
      </Box>
      <Box className="orders-list">
        <Typography variant="h6" component={"h6"} mb={2}>
          Your orders
        </Typography>
        <Box>
          {loading &&
            Array.from(new Array(3)).map((_, index) => {
              return (
                <Card key={index} sx={{ borderRadius: "20px", mb: 1, p: 1 }}>
                  <Skeleton
                    height={100}
                    width={"100%"}
                    sx={{ borderRadius: "10px" }}
                  />
                </Card>
              );
            })}

          {!loading && !orders?.length && (
            <Card
              sx={{
                p: 3,
                borderRadius: "20px",
                display: "grid",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant={"subtitle1"} mb={2}>
                You have no order yet
              </Typography>
              {!user && (
                <Link href="/sign-in?redirect=/orders">
                  <Button color="primary" variant="contained">
                    Sign in
                  </Button>
                </Link>
              )}
            </Card>
          )}

          {!loading &&
            orders?.map((order, index) => {
              return <Order {...order} key={index} />;
            })}
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  //@ts-ignore
  const user = req.session.user ?? null;

  return {
    props: {
      user,
    },
  };
};
