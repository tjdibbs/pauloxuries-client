import React from "react";
import { useForm } from "react-hook-form";
import { CartProduct, Product } from "@lib/types";
import { motion } from "framer-motion";

// components
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
} from "@mui/material";

// hooks
import { useRouter } from "next/router";

// state management
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { setWish, removeWish } from "@lib/redux/reducer";
import { deleteCart, updateCarts } from "@lib/redux/cartSlice";

// icons
import Add from "@mui/icons-material/Add";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

type State = { quantity: string | number; size: number };

function Cart({ cart }: { cart: CartProduct }) {
  const { register, watch, setValue } = useForm<State>({
    defaultValues: {
      quantity: cart.quantity,
    },
  });
  const { quantity } = watch();
  const { user, wishlists } = useAppSelector((state) => state.shop);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const inWishlist = wishlists.includes(cart.product!.id!);

  const handleState = (name: keyof State, n: number) => {
    if (
      (name === "quantity" && quantity === 1 && n === -1) ||
      (quantity === cart.product!.stock && n === 1)
    ) {
      return;
    }

    setValue(name, parseInt(quantity as string) + n);
    handleCartQuantity(parseInt(quantity as string) + n);
  };

  const handleCartQuantity = (value: string | number) => {
    dispatch(
      updateCarts({
        cartid: cart.id as string,
        userid: user?.id,
        cart: {
          ...(cart as CartProduct),
          quantity: parseInt(value as string),
        },
      })
    );
  };

  const handleRemoveCart = () => {
    dispatch(deleteCart({ userid: user?.id, cartid: cart.id as string }));
  };

  const AddToWishlist = () => dispatch(setWish(cart.id as string));
  const RemoveWishlist = () => dispatch(removeWish(cart.id as string));

  let { price, discountPercentage } = cart.product as Product;
  console.log({ cart });
  const cartTotalPrice =
    (price as number) * cart.quantity! -
    (price as number) * (discountPercentage / 100);

  return (
    <div className="card bg-white/70 backdrop-blur">
      <div className="flex gap-2 items-center p-2">
        <Avatar
          variant={"rounded"}
          src={"/images/products/" + cart.product!.image}
        >
          <ShoppingCartCheckoutIcon />
        </Avatar>
        <span className="flex-grow font-semibold overflow-hidden text-ellipsis">
          {cart.product!.title}
        </span>
        <Chip
          label={cart.product?.stock! - cart.product!.sold! + " in stock"}
        />
      </div>
      <div className="card-content px-2 my-5">
        <div className="flex justify-between items-center">
          <TextField
            label={"Quantity"}
            {...register("quantity", {
              onChange: (e) => {
                if (!e.target.value) setValue("quantity", 1);
                handleCartQuantity(parseInt(e.target.value));
              },
              max: cart.product!.stock,
              value: cart.quantity as unknown as string,
            })}
            size={"small"}
            sx={{
              width: 130,
              "& .MuiOutlinedInput-input": { textAlign: "center" },
            }}
            InputProps={{
              // eslint-disable-next-line react/jsx-no-undef
              startAdornment: (
                <IconButton
                  size={"small"}
                  sx={{ width: "30px" }}
                  onClick={() => handleState("quantity", -1)}
                >
                  &minus;
                </IconButton>
              ),
              endAdornment: (
                <IconButton
                  size={"small"}
                  onClick={() => handleState("quantity", 1)}
                >
                  <Add fontSize={"small"} />
                </IconButton>
              ),
            }}
          />
          <Box>
            <span className="text-sm font-bold mr-2 text-primary-low">
              #{cartTotalPrice.toLocaleString("en")} -
            </span>
            <span className="text-xs">
              #{cart.product!.price?.toLocaleString("en")} per 1 item
            </span>
          </Box>
        </div>
      </div>
      <div className="flex gap-x-3 px-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleRemoveCart}
          className="btn text-sm bg-primary-low text-white"
        >
          Remove from cart
        </motion.button>
        <Button
          size={"small"}
          color={"warning"}
          variant={inWishlist ? "contained" : "outlined"}
          sx={{ textTransform: "none" }}
          onClick={inWishlist ? RemoveWishlist : AddToWishlist}
        >
          Add to wishlist
        </Button>
        <Button
          size={"small"}
          color={"warning"}
          variant={inWishlist ? "contained" : "outlined"}
          sx={{ textTransform: "none" }}
          onClick={() =>
            router.push(
              "/products?p=" + cart.product!.title + "&id=" + cart.product!.id
            )
          }
        >
          View
        </Button>
      </div>
    </div>
  );
}

export default Cart;
