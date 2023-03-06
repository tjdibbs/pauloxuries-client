/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { CartProduct, Product } from "@lib/types";
import useMessage from "hooks/useMessage";
import { AnimatePresence, motion } from "framer-motion";

// material ui components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";

// state management
import { useAppSelector, useAppDispatch } from "@lib/redux/store";
import { setWish, removeWish } from "@lib/redux/reducer";
import { addToCarts, deleteCart } from "@lib/redux/cartSlice";

// icons from material ui
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Spin } from "antd";
import { nanoid } from "nanoid";

type Props = {
  item: Product;
  sm?: number;
  xs?: number | string;
  md?: number;
  component?: "div";
};

export default function ProductStyle2({ item, sm, xs, component, md }: Props) {
  const dispatch = useAppDispatch();
  const { alertMessage } = useMessage();
  const { carts, wishlists, user } = useAppSelector((state) => state.shop);
  const [loading, setLoading] = React.useState<boolean>(false);

  const inCart = carts.findIndex((cart) => cart.product!.id === item.id);
  const inWishlist = wishlists.includes(item.id);

  const handleAddCart = () => {
    setLoading(true);

    const cartProduct: Partial<CartProduct> = {
      user: user?.id,
      product: { id: item.id },
      quantity: 1,
    };

    dispatch(addToCarts({ user: user!?.id, cart: cartProduct }))
      .then(() => {
        alertMessage(item.title + " added to cart", "success");
      })
      .finally(() => setLoading(false));
  };

  const handleRemoveCart = () => {
    setLoading(true);
    dispatch(deleteCart({ userid: user?.id, cartid: item.id }))
      .then(() => {
        alertMessage(item.title + " removed from cart", "warning");
      })
      .finally(() => setLoading(false));
  };

  const handleWish = () => {
    dispatch(inWishlist ? removeWish(item.id) : setWish(item.id));
  };

  let isOutOfStock = Boolean(item.stock - item.sold < 1);

  const ProductItem = (
    <motion.div
      layoutId={item.id}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      key={item.id}
      className={
        "product-items bg-primary-low/5 shadow-xl relative overflow-hidden"
      }
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            className={
              "grid place-items-center bg-black/40 absolute h-full w-full top-0 left-0"
            }
            animate={{ opacity: 1 }}
            initial={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Spin />
          </motion.div>
        )}
      </AnimatePresence>
      {Boolean(item.discountPercentage) &&
        !Boolean(item.stock - item.sold < 1) && (
          <Chip
            label={item.discountPercentage + "% discount"}
            size={"small"}
            className="!bg-primary-low text-white absolute top-2.5 right-2.5"
          />
        )}
      {isOutOfStock && (
        <Chip
          label={"Out of stock"}
          size={"small"}
          className="!bg-primary-low text-white absolute top-2.5 right-2.5"
        />
      )}
      <div>
        <img
          src={
            "https://pauloxuries.com/images/products/" +
            JSON.parse(item.images)[0]
          }
          alt={item.title}
          className={`w-full object-fill h-[250px] md:h-[330px] pointer-events-none`}
        />
      </div>
      <Box p={1}>
        <Box textAlign="left">
          <p className="whitespace-nowrap mb-2 capitalize font-semibold overflow-hidden text-ellipsis">
            {item.title}
          </p>
          {item.discountPercentage ? (
            <Box>
              <span className="text-primary-low font-bold">
                ₦
                {Math.floor(
                  (item.price as number) -
                    (item.price as number) * (item.discountPercentage / 100)
                ).toLocaleString("en")}
                {"  -  "}
              </span>
              <span className="line-through">
                ₦{item.price.toLocaleString("en")}
              </span>
            </Box>
          ) : (
            <span className="text-primary-low font-bold">
              ₦{item.price.toLocaleString()}
            </span>
          )}
        </Box>
        <div className="flex items-center gap-x-2 my-2">
          <Link
            href={"/products?p=" + item.title + "&id=" + item.id}
            className="text-primary-low"
          >
            <Button size="small" color="inherit" variant="outlined">
              View
            </Button>
          </Link>
          <Tooltip
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconButton
              onClick={handleWish}
              color={inWishlist ? "warning" : "default"}
            >
              {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          {!isOutOfStock && (
            <Tooltip title={inCart !== -1 ? "Remove from cart" : "Add to cart"}>
              <IconButton
                color={inCart !== -1 ? "warning" : "default"}
                onClick={inCart !== -1 ? handleRemoveCart : handleAddCart}
              >
                <AddShoppingCartIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Box>
    </motion.div>
  );

  if (component === "div") return ProductItem;

  return (
    <Grid
      item
      xs={6}
      sm={sm ?? 4}
      md={3}
      sx={{ height: xs ? "100%" : "initial" }}
    >
      {ProductItem}
    </Grid>
  );
}
