import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CartProduct } from "../types";

type updateParams = {
  cartid: string;
  userid?: string;
  cart: CartProduct;
};

type setParams = { userid?: string; carts: CartProduct[] };

type addParams = { id?: string; cart: CartProduct };
type deleteParams = { userid?: string; cartid: string };

export const addToCarts = createAsyncThunk(
  "shop/cart/add",
  async (params: addParams) => {
    try {
      if (!params.id) return params.cart;
      await axios.put<{ success: boolean }>(
        "/api/carts/" + params.id,
        params.cart
      );

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
      await axios.delete("/api/carts/" + params.userid + "/" + params.cartid);
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
      console.log({ params });
      if (!params.userid) return params;
      await axios.post(
        "/api/carts/" + params.userid + "/update/" + params.cartid,
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
      await axios.post<{ success: boolean }>(
        "/api/carts/all/" + params.userid,
        params.carts
      );
      return params.carts;
    } catch (e: any) {
      return params.carts;
    }
  }
);
