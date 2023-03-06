import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import type { AppState, CartProduct } from "@lib/types";
import Checkout from "@comp/cart/checkout";
import Nocart from "@comp/cart/nocart";
import Cart from "@comp/cart/CartProduct";
import FetchCartsHook from "@comp/fetchCartsHook";
import axios from "axios";
import { BASE_URL } from "@lib/constants";
import { setAllCarts } from "@lib/redux/cartSlice";
import { setAllCart } from "@lib/redux/reducer";

interface Props {
  user: AppState["user"];
}

export default function Carts(props: Props) {
  const { carts, user } = useAppSelector((state) => state.shop);
  const [loading, setLoading] = React.useState<boolean>(true);

  const dispatch = useAppDispatch();

  const updateCartFields = (products: CartProduct["product"][]) => {
    // after getting the updated details of the cart product,
    // we update the localCart with the detail we get from backend
    // note: cart are updated by their cart id
    let compiledCarts = products.map((productDetail) => {
      let localCart = carts.find(
        (cart) => cart.product?.id == productDetail.id
      ) as CartProduct;
      return {
        ...localCart,
        product: productDetail,
      };
    });

    dispatch(setAllCart(compiledCarts));
    setLoading(false);
  };

  React.useEffect(() => {
    if (!user) {
      // we need to send the local cart ids to get the updated cart product details
      let localCartIds = carts.map((cart) => cart.product?.id);
      axios
        .post<{ products: CartProduct[] }>(
          BASE_URL + `/api/products/info`,
          localCartIds
        )
        .then((res) => updateCartFields(res.data.products))
        .catch(console.error);
    } else {
      axios
        .get<{ carts: CartProduct[] }>(BASE_URL + `/carts/` + user?.id)
        .then((res) => {
          dispatch(setAllCart(res.data.carts));
          setLoading(false);
        });

      setLoading(false);
    }
  }, [user]);

  return (
    <Container maxWidth={"xl"} sx={{ p: 0 }} className="component-wrap">
      {/*<Head>*/}
      {/*  <title>Pauloxuries - {props.user!?.firstname ?? "User"} Carts</title>*/}
      {/*</Head>*/}
      <Box my={3}>
        <Breadcrumbs
          separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
        >
          <Link href={"/"}>
            <Typography sx={{ cursor: "pointer" }} variant={"subtitle2"}>
              Home
            </Typography>
          </Link>
          <Link href={"/collections"}>
            <Typography variant={"subtitle2"}>Shop</Typography>
          </Link>
          <Typography variant={"subtitle2"}>Cart</Typography>
        </Breadcrumbs>
      </Box>
      <section className={"main-content mt-5"}>
        <h5 className="title font-bold text-lg bg-primary-low/10 px-4 py-2 rounded-lg mb-3 w-max">
          Shopping Cart
        </h5>
        <div className="flex flex-wrap justify-end gap-3">
          {!loading ? (
            <React.Fragment>
              <div className="flex-grow flex flex-col gap-y-3">
                {carts.map((cart, index) => {
                  return <Cart key={index} cart={cart as CartProduct} />;
                })}
              </div>
              <Box sx={{ width: { xs: "100%", sm: 300 } }}>
                {/*<Checkout carts={carts} />*/}
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Box sx={{ flexGrow: 1 }}>
                {Array.from(new Array(5)).map((product, index) => {
                  return (
                    <Paper
                      sx={{ p: 2, mb: 2, borderRadius: "20px" }}
                      key={index}
                    >
                      <Skeleton
                        variant={"rectangular"}
                        className="w-full rounded-lg h-[30px]"
                      />
                      <Stack
                        sx={{ mt: 3 }}
                        direction={"row"}
                        justifyContent={"space-between"}
                      >
                        <Skeleton
                          variant={"rectangular"}
                          width={80}
                          height={30}
                          sx={{ borderRadius: "20px" }}
                        />
                        <Box>
                          <Skeleton
                            variant={"rectangular"}
                            width={100}
                            height={10}
                            sx={{ mb: 1, borderRadius: "20px" }}
                          />
                          <Skeleton
                            variant={"rectangular"}
                            width={60}
                            height={10}
                            sx={{ borderRadius: "20px" }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
              <Paper sx={{ width: 300, display: "grid", placeItems: "center" }}>
                <CircularProgress />
              </Paper>
            </React.Fragment>
          )}
        </div>
        <Nocart carts={carts} />
      </section>
    </Container>
  );
}
