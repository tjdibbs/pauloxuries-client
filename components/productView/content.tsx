import React from "react";
import {
  Box,
  Button,
  CardActions,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import Add from "@mui/icons-material/Add";

import { useForm } from "react-hook-form";
import { Cart, CartProduct, Product } from "@lib/types";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { useSnackbar } from "notistack";
import dynamic from "next/dynamic";
import { addToCarts, deleteCart, updateCarts } from "@lib/redux/cartSlice";
import Cookie from "js-cookie";
import router from "next/router";

type State = {
  quantity: string | number;
  size: number | string;
  color: string;
};

function ProductContent(props: { product: Product }) {
  const { product } = props;
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { carts, user } = useAppSelector((state) => state.shop);

  const inCart = carts.findIndex((cart) => cart.product_id === product.id);

  const { register, watch, setValue, reset } = useForm<State>();
  const { quantity, size, color } = watch();

  React.useEffect(() => {
    reset({
      quantity: inCart !== -1 ? carts[inCart].quantity : 1,
      size: JSON.parse(product.sizes)[0],
      color: JSON.parse(product.colors)[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleState = (name: keyof State, n: number | string) => {
    switch (name) {
      case "quantity":
        setValue(name, parseInt(quantity as string) + (n as number));
        break;
      default:
        setValue(name, n);
    }

    handleCartChange();
  };

  const handleAddCart = () => {
    const cartProduct: CartProduct = {
      product_id: product.id,
      quantity: 1,
      color,
      size: product.sizes?.length ? product.sizes[0] : "",
      discountPercentage: product.discountPercentage,
      totalPrice: product.price as number,
    };

    dispatch(addToCarts({ id: user!?.id, cart: cartProduct })).then(() => {
      enqueueSnackbar("Added to cart", {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        autoHideDuration: 2000,
      });
    });
  };

  const handleRemoveCart = () => {
    dispatch(deleteCart({ userid: user?.id, cart_id: product.id })).then(() => {
      enqueueSnackbar("Removed from cart", {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        autoHideDuration: 2000,
      });
    });
  };

  const handleCheckout = () => {
    let T = (product.price as number) * (quantity as number);
    let checkout: Cart<CartProduct> = {
      products: [
        {
          product_id: product.id,
          product: {
            ...product,
            image: JSON.parse(product.images || "[]")[0],
          },
          quantity: quantity as number,
          size,
          color,
          discountPercentage: product.discountPercentage,
          totalPrice: T - (product.discountPercentage / 100) * T,
        },
      ],
      total: (product.price as number) * (quantity as number),
      discountedTotal:
        (product.discountPercentage / 100) *
        (product.price as number) *
        parseInt(quantity as string),
      totalQuantity: quantity as number,
      totalPrice:
        (product.price as number) * parseInt(quantity as string) -
        (product.discountPercentage / 100) *
          (product.price as number) *
          parseInt(quantity as string),
    };

    //Set current checkout to cookie to get it in the checkout page
    Cookie.set("checkout", JSON.stringify(checkout), { expires: 7 });
    router.push("/checkout/");
  };

  const handleCartChange = () => {
    if (inCart === -1) return;
    dispatch(
      updateCarts({
        cart_id: product.id,
        userid: user?.id,
        cart: {
          size: size,
          product_id: product.id,
          color,
          discountPercentage: product.discountPercentage,
          totalPrice: (product.price as number) * (quantity as number),
          quantity: parseInt(quantity as string),
        },
      })
    );
  };

  return (
    <div className="product-content card sm:w-full rounded-lg sm:p-4 h-full">
      {product.discountPercentage ? (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color={"primary"}>
            <b style={{ fontSize: "1.17em" }}>₦</b>
            {Math.floor(
              (product.price as number) -
                ((product.price as number) * product.discountPercentage) / 100
            ).toLocaleString("en")}
          </Typography>
          <Typography variant="caption" sx={{ textDecoration: "line-through" }}>
            ₦{product.price.toLocaleString("en")}
          </Typography>
          <small> - discount {product.discountPercentage}%</small>
        </Box>
      ) : (
        <Typography variant="subtitle1" fontWeight={800} color={"primary"}>
          <b style={{ fontSize: "1.17em" }}>₦</b>
          {product.price.toLocaleString("en")}
        </Typography>
      )}
      <Box className="tags" mt={1}>
        <Stack direction="row" spacing={2}>
          {product.category.split(",").map((tag: string) => {
            return (
              <a
                title={tag}
                style={{ textDecoration: "none", cursor: "pointer" }}
                href={"/category/" + tag}
                key={tag}
              >
                <Chip label={tag} size="small" />
              </a>
            );
          })}
        </Stack>
      </Box>
      <Typography variant={"subtitle2"} my={2}>
        <Link
          href={"/shipping"}
          style={{ color: "#660132", textDecoration: "none" }}
          passHref
        >
          <b>Shipping</b>
        </Link>{" "}
        Calculated at checkout
      </Typography>
      <Divider />
      <Box className="colors" my={2}>
        <Typography variant={"subtitle1"} fontWeight={500} my={2}>
          Product Colors
        </Typography>
        <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
          {JSON.parse(product.colors)
            ?.filter((p: string) => p)
            .map((c: string) => {
              return (
                <Chip
                  label={c}
                  key={c}
                  onClick={() => {
                    handleState("color", c);
                    handleCartChange();
                  }}
                  variant={color == c ? "filled" : "outlined"}
                />
              );
            })}
        </Stack>
        {!JSON.parse(product.colors).filter((p: string) => p)?.length && (
          <Typography variant="caption">
            Find the only color from product pictures
          </Typography>
        )}
      </Box>
      <Divider />
      <Box className="sizes" my={2}>
        <Typography variant={"subtitle1"} fontWeight={500} my={2}>
          Sizes Available
        </Typography>
        <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
          {JSON.parse(product.sizes)
            ?.filter((p: string) => p)
            .map((siz: string) => {
              return (
                <Chip
                  label={siz}
                  key={siz}
                  onClick={() => {
                    handleState("size", siz);
                    handleCartChange();
                  }}
                  variant={size === siz ? "filled" : "outlined"}
                />
              );
            })}
        </Stack>
        {!JSON.parse(product.sizes).filter((p: string) => p)?.length && (
          <Typography variant="caption">
            This product does not have sizes
          </Typography>
        )}
      </Box>
      <Divider />
      <Box className="quantity">
        <Typography variant={"subtitle1"} fontWeight={500} my={2}>
          Product Quantity To Deliver
        </Typography>
        <FormControl
          size={"small"}
          sx={{
            m: 1,
            width: 150,
            "& .MuiOutlinedInput-input": { textAlign: "center" },
          }}
        >
          <InputLabel htmlFor="quantity">Quantity</InputLabel>
          <OutlinedInput
            id="quantity"
            {...register("quantity", {
              required: true,
              onChange: (e) => {
                let value = e.target.value;
                if (!/^\d+$/.test(value) || value.length > 2) {
                  setValue("quantity", quantity);
                  if (value) handleCartChange();
                }
              },
            })}
            autoComplete={"off"}
            startAdornment={
              <InputAdornment position="start">
                <IconButton
                  size={"small"}
                  sx={{ width: "30px" }}
                  onClick={() => handleState("quantity", -1)}
                >
                  &minus;
                </IconButton>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position={"end"}>
                <IconButton
                  size={"small"}
                  onClick={() => handleState("quantity", 1)}
                >
                  <Add fontSize={"small"} />
                </IconButton>
              </InputAdornment>
            }
            label="Quantity"
          />
        </FormControl>
      </Box>
      {product.stock - product.sold > 0 ? (
        <CardActions className={"action-group"} sx={{ my: 2 }}>
          <button
            onClick={inCart === -1 ? handleAddCart : handleRemoveCart}
            className={`text-sm ${
              inCart === -1
                ? "btn-outlined ring-slate-600 text-gray-600"
                : "btn text-white bg-slate-600"
            }`}
          >
            {inCart !== -1 ? "Remove from cart" : "Add to cart"}
          </button>
          <Button
            onClick={handleCheckout}
            variant={"outlined"}
            sx={{ textTransform: "none" }}
          >
            Buy Now
          </Button>
        </CardActions>
      ) : (
        <Typography variant={"subtitle1"} color={"error"}>
          Sorry: Products is out of stock
        </Typography>
      )}
    </div>
  );
}

export default dynamic(async () => await ProductContent, { ssr: false });
