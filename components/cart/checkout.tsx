import { Cart, CartProduct, Product } from "@lib/types";
import { Box, Button, Card, Divider, Paper } from "@mui/material";
import Link from "next/link";
import React from "react";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import Cookie from "js-cookie";
import router from "next/router";

function Checkout({ carts }: { carts: CartProduct[] }) {
  if (!carts?.length) return <></>;

  const totalProducts = carts.reduce<number>((total, cart) => {
    let { price, discountPercentage } = cart.product as Product;
    let cartTotalPrice =
      (price as number) * cart.quantity -
      (price as number) * (discountPercentage / 100);
    return total + cartTotalPrice;
  }, 0);

  const discountedTotal = Math.floor(
    carts.reduce<number>((totalDiscount, cart) => {
      let discountPercentage = cart.product.discountPercentage!;

      let discountedTotal =
        (discountPercentage / 100) *
        (cart.product!?.price as number) *
        cart.quantity;
      return totalDiscount + discountedTotal;
    }, 0)
  );

  const totalQuantity = carts.reduce<number>((totalQuantity, cart) => {
    return totalQuantity + cart.quantity;
  }, 0);

  const totalPrice = totalProducts - discountedTotal;

  const handleCheckout = () => {
    let checkout: Cart<CartProduct> = {
      products: carts,
      total: totalProducts,
      discountedTotal,
      totalQuantity,
      totalPrice,
    };

    //Set current checkout to cookie to get it in the checkout page
    Cookie.set("checkout", JSON.stringify(checkout), { expires: 7 });
    router.push("/checkout/");
  };

  return (
    <div className="card bg-white/70 backdrop-blur-lg">
      <div className="p-4 flex gap-x-3 font-bold">
        <ShoppingCartCheckoutIcon />
        <span>Cart Totals</span>
      </div>
      <Divider />
      <Box role={"application"} className="p-4 flex flex-col gap-y-4">
        <div id={"total-price"} className="flex justify-between">
          <span>Total Price</span>
          <b>₦{totalProducts.toLocaleString("en")}</b>
        </div>
        <div id={"discount"} className="flex justify-between">
          <span>Discount</span>
          <b>₦{discountedTotal.toLocaleString("en")}</b>
        </div>
        <Divider />
        <div id={"total"} className="flex justify-between">
          <span>Total</span>
          <b className="bg-black/5 px-3 py-2 text-primary-low rounded-lg shadow-sm">
            ₦{totalPrice.toLocaleString("en")}
          </b>
        </div>
        <Button
          variant={"contained"}
          size={"large"}
          className="bg-primary-low w-full rounded-lg font-bold"
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </Box>
    </div>
  );
}

export default Checkout;
