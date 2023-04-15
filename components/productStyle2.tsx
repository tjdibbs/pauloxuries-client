/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { CartInterface, Product } from "@lib/types";
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
import { addToCarts, deleteCart } from "@lib/redux/cartSlice";
import { addToWish, deleteWish } from "@lib/redux/wishSlice";

// icons from material ui
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Spin } from "antd";
import { nanoid } from "nanoid";
import useShop from "@hook/useShop";
import ImageLoader from "./ImageLoader";
import Image from "next/image";
import DeleteForever from "@mui/icons-material/DeleteForever";
import Edit from "@mui/icons-material/Edit";

type Props = {
  item: Product;
  sm?: number;
  xs?: number | string;
  md?: number;
  component?: "div";
  inCart: number;
  inWishlist: boolean;
  children?: React.ReactNode;
  keyPrefix?: string;
};

function ProductStyle2(props: Props) {
  const {
    inCart,
    inWishlist,
    item,
    sm,
    xs,
    component,
    keyPrefix = "_",
  } = props;
  const {
    handleAddCart,
    handleRemoveCart,
    handleWish,
    deleteProduct,
    editProduct,
    loading,
  } = useShop(props.item);

  const user = useAppSelector((state) => state.shop.user);

  let isOutOfStock = Boolean(item.stock - item.sold < 1);

  const ProductItem = (
    <motion.div
      layoutId={item.id}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      key={keyPrefix + item.id}
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

      {/* Show if product has discount */}
      {Boolean(item.discountPercentage) &&
        !Boolean(item.stock - item.sold < 1) && (
          <Chip
            label={item.discountPercentage + "% OFF"}
            size={"small"}
            className="!bg-primary-low text-white absolute font-bold top-2.5 right-2.5 z-10"
          />
        )}

      {/* show if product is out of stock */}
      {isOutOfStock && (
        <Chip
          label={"Out of stock"}
          size={"small"}
          className="!bg-primary-low text-white absolute top-2.5 right-2.5 z-10"
        />
      )}

      {/* show if user is admin to call action on the product */}
      {user?.admin && (
        <div className="product-higher-actions absolute left-0 top-0 z-20 flex flex-col gap-y-2 bg-black/10 rounded-lg p-2">
          <IconButton size="small" onClickCapture={editProduct}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClickCapture={deleteProduct}>
            <DeleteForever fontSize="small" />
          </IconButton>
        </div>
      )}

      {props.children ?? (
        <div className="max-xs:h-[200px] h-[250px] md:h-[330px] relative">
          <Image
            src={
              "http://pauloxuries.com/images/products/" +
              item.image?.replaceAll('"', "")
            }
            loading="lazy"
            alt={item.title}
            fill
            sizes="(max-width: 528px) 250px, (max-width: 768px) 330px"
            className={`w-full object-fill  pointer-events-none`}
          />
        </div>
      )}
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
                onClick={
                  inCart !== -1 ? handleRemoveCart : () => handleAddCart()
                }
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

export default React.memo(ProductStyle2);
