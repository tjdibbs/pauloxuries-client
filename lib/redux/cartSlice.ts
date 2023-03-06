import { BASE_URL } from "../constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CartProduct } from "../types";

type updateParams = {
  cartid: string;
  userid?: string;
  cart: CartProduct;
};

const CART_URL = BASE_URL + "/api/carts/";

type setParams = { userid?: string; carts: CartProduct[] };
type addParams = { user?: string; cart: Partial<CartProduct> };
type deleteParams = { userid?: string; cartid: string };

export const addToCarts = createAsyncThunk(
  "shop/cart/add",
  async (params: addParams) => {
    try {
      //   if no user, that means the user hasn't signed in
      //   return the cart to be added to user local cart
      if (!params.user) return params.cart;

      await axios.put(CART_URL + "/new", {
        carts: [params.cart],
        user: params.user,
      });

      return params.cart;
    } catch (e: any) {
      return params.cart;
    }
  }
);

export const deleteCart = createAsyncThunk(
  "shop/cart/delete",
  async (params: deleteParams) => {
    try {
      if (!params.userid) return params;
      await axios.delete(CART_URL + params.userid + "/" + params.cartid);
      return params;
    } catch (e: any) {
      return params;
    }
  }
);

export const updateCarts = createAsyncThunk(
  "shop/carts/update",
  async (params: updateParams) => {
    try {
      if (!params.userid) return params;
      await axios.post(
        BASE_URL + "/api/carts/" + params.userid + "/" + params.cartid,
        params.cart
      );

      return params;
    } catch (e: any) {
      return params;
    }
  }
);

export const setAllCarts = createAsyncThunk(
  "shop/cart/set",
  async (params: setParams) => {
    try {
      if (!params.userid) return params.carts;
      await axios.put<{ success: boolean }>(
        CART_URL + params.userid,
        params.carts
      );

      return params.carts;
    } catch (e: any) {
      return params.carts;
    }
  }
);
