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
import type { AppState, CartProduct, Product } from "@lib/types";
import Checkout from "@comp/cart/checkout";
import Nocart from "@comp/cart/nocart";
import Cart from "@comp/cart/CartProduct";
import FetchCartsHook from "@comp/fetchCartsHook";
import axios from "axios";
import { BASE_URL } from "@lib/constants";
import { setAllCarts } from "@lib/redux/cartSlice";
import { setAllCart } from "@lib/redux/reducer";
import useMessage from "@hook/useMessage";

interface Props {
  user: AppState["user"];
}

export default function Carts(props: Props) {
  const { carts, user } = useAppSelector((state) => state.shop);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { alertMessage } = useMessage();

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
  };

  React.useEffect(() => {
    // we need to send the local cart ids to get the updated cart product details
    let localcart_ids = carts.map((cart) => cart.product?.id);
    if (!localcart_ids?.length) return;

    (async () => {
      try {
        // if user is signed in it made a get request while there is no user it made a post request
        const req = await axios[user ? "get" : "post"]<
          | { products: Product[] }
          | {
              carts: CartProduct[];
            }
        >(
          BASE_URL + (user ? `/carts/` + user?.id : `/api/products/info`),
          localcart_ids
        );

        const res = await req.data;

        // if user is signed in, it means carts is coming from the server else if the user is not signed
        // in then access the carts page the endpoint will return each cart product details which can be accessible by
        // the cart product id
        user
          ? dispatch(setAllCart((res as { carts: CartProduct[] }).carts))
          : updateCartFields((res as { products: Product[] }).products);
      } catch (e) {
        console.error({ e });
        alertMessage(
          "We are having issue communicating with the server",
          "error"
        );
      } finally {
        setLoading(false);
      }
    })();
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
        <div className="flex flex-wrap justify-end gap-3 my-5">
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
            <CartSkeleton />
          )}
        </div>
        {!loading && <Nocart carts={carts} />}
      </section>
    </Container>
  );
}

const CartSkeleton = () => (
  <React.Fragment>
    <Box sx={{ flexGrow: 1 }}>
      {Array.from(new Array(5)).map((product, index) => {
        return (
          <div className={"card p-4 mb-4"} key={index}>
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
              <div>
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
              </div>
            </Stack>
          </div>
        );
      })}
    </Box>
    <div className={"card w-[300px] grid place-items-center bg-primary-low/10"}>
      <CircularProgress />
    </div>
  </React.Fragment>
);
