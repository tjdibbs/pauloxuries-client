import { BASE_URL } from "../constants";
import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { AppState, CartProduct } from "../types";
import Cookie from "js-cookie";

type updateParams = {
  cart_id: string;
  userid?: string;
  cart: CartProduct;
};

const CART_URL = BASE_URL + "/api/carts/";

type setParams = { userid?: string; carts: CartProduct[] };
type addParams = { user?: string; cart: Partial<CartProduct> };
type deleteParams = { userid?: string; cart_id: string };

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
      await axios.delete(CART_URL + params.userid + "/" + params.cart_id);
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
        BASE_URL + "/api/carts/" + params.userid + "/" + params.cart_id,
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

export const CartBuilder = (builder: ActionReducerMapBuilder<AppState>) => {
  // add cart fulfilled callback
  builder.addCase(
    addToCarts.fulfilled,
    (state, actions: PayloadAction<Partial<CartProduct>>) => {
      state.carts.push(actions.payload);

      if (
        state.user &&
        !state.user?.carts.includes(actions.payload.id as string)
      ) {
        state.user?.carts.push(actions.payload.id as string);
      }

      Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
    }
  );

  // cart update request fulfilled callback
  builder.addCase(updateCarts.fulfilled, (state, actions) => {
    const { cart_id, cart: updatedCart } = actions.payload;
    state.carts = state.carts.map((cart) => {
      if (cart.id === cart_id) return { ...cart, ...updatedCart };
      return cart;
    });

    Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
  });

  // carts delete request fulfilled callback
  builder.addCase(deleteCart.fulfilled, (state, actions) => {
    state.carts = state.carts.filter(
      (cart) => cart.product?.id !== actions.payload.cart_id
    );
    Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
  });

  // set all user carts fulfilled callback
  builder.addCase(setAllCarts.fulfilled, (state, actions) => {
    state.carts = actions.payload;
    Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
  });
};
