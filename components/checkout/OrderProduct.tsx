import React from "react";
import { Avatar, Badge, Button, Chip } from "@mui/material";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { CartInterface, OrderType } from "@lib/types";
import { useAppSelector } from "@lib/redux/store";
import { useRouter } from "next/router";
import axios from "axios";
import useMessage from "@hook/useMessage";
import Image from "next/image";

const OrderProduct = (props: {
  cartProduct: CartInterface;
  setOrder: React.Dispatch<React.SetStateAction<OrderType | undefined>>;
}) => {
  const { cartProduct } = props;
  const user = useAppSelector((state) => state.shop.user);
  const { alertMessage } = useMessage();

  let discount =
    ((cartProduct.product.discountPercentage as number) / 100) *
    cartProduct.quantity;

  let total =
    (cartProduct.product?.price as number) * cartProduct.quantity - discount;

  const cancelOrder = () => {
    try {
    } catch (error) {}
  };

  return (
    <div className="ordered-product card bg-primary-low/10">
      <div className="detail">
        <div className="flex gap-2 items-center">
          <Badge
            badgeContent={cartProduct.quantity}
            className="rounded-sm"
            classes={{ badge: "rounded-lg bg-primary-low" }}
            color={"info"}
          >
            <div className="image-wrap relative p-1 bg-white shadow-lg rounded-lg">
              <Image
                width={40}
                height={50}
                alt={cartProduct.product.title as string}
                src={
                  "https://pauloxuries.com/images/products/" +
                  cartProduct.product!.image?.replaceAll('"', "")
                }
              />
            </div>
          </Badge>
          <div className="title flex-grow ml-3">
            <span className="font-semibold overflow-hidden text-ellipsis">
              {cartProduct.product.title}
            </span>
            {cartProduct.product.discountPercentage && (
              <>
                <br />
                <small>
                  {cartProduct.product.discountPercentage}% discount each
                </small>
              </>
            )}
          </div>
          <div className="price flex flex-col justify-end gap-y-2">
            <Chip
              className="font-extrabold text-lg text-primary-low"
              label={"₦" + total.toLocaleString()}
            />
            <small>
              {"₦" + (cartProduct.product.price as number).toLocaleString()} per
              item
            </small>
          </div>
        </div>
      </div>
      <div className="flex gap-x-6 gap-y-3 flex-wrap items-center mt-4">
        <div className="wrap flex-wrap flex gap-x-6 gap-y-3 flex-grow">
          {Boolean(cartProduct.sizes?.length) && (
            <div className="sizes-wrap flex gap-x-4 items-center">
              <div className="label text-sm">Sizes:</div>
              <ul className="sizes-selected flex gap-2">
                {cartProduct.sizes?.map((size) => (
                  <div
                    key={size}
                    className="bg-black/10 uppercase h-6 w-6 grid place-items-center shadow-lg rounded-lg font-bold text-[10px]"
                  >
                    {size}
                  </div>
                ))}
              </ul>
            </div>
          )}
          {Boolean(cartProduct.colors?.length) && (
            <div className="colors-wrap flex gap-x-4 items-center">
              <div className="label text-sm">Colors:</div>
              <ul className="colors-selected flex gap-2">
                {cartProduct.colors?.map((color) => (
                  <div
                    key={color}
                    style={{ background: color }}
                    className="bg-black/10 uppercase h-4 w-10 shadow-lg rounded-full font-bold text-xs"
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {user && (
          <div className="actions">
            <Button
              size="small"
              variant="outlined"
              className="capitalize text-sm"
              onClick={cancelOrder}
            >
              cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProduct;
