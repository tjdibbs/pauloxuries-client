import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { AppState, CartProduct, Product } from "../types";
import Cookie from "js-cookie";
import { addToCarts, deleteCart, updateCarts, setAllCarts } from "./cartSlice";
import getCurrentTheme from "lib/getCurrentTheme";

const carts = Cookie.get("carts");
const wishlist = Cookie.get("wishlists");
const theme = Cookie.get("theme") as "light" | "dark" | "default";
const mode = "light";

const initialState: AppState = {
  // @ts-ignore
  mode,
  carts: carts ? JSON.parse(carts) : [],
  theme: theme ?? "default",
  wishlists: wishlist ? JSON.parse(wishlist) : [],
  loggedIn: false,
};

const Shop = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setCart: (state: AppState, actions: PayloadAction<CartProduct>) => {
      state.carts.push(actions.payload);
      Cookie.set("carts", JSON.stringify(state.carts));
    },
    setAllCart: (state: AppState, actions: PayloadAction<CartProduct[]>) => {
      state.carts = actions.payload;
      Cookie.set("carts", JSON.stringify(state.carts));
    },

    removeCart: (state: AppState, actions: PayloadAction<string>) => {
      let product = state.carts.findIndex(
        (cart) => cart.product_id === actions.payload
      );
      state.carts.splice(product, 1);
      Cookie.set("carts", JSON.stringify(state.carts), { expires: 365 });
    },
    updateCart: (
      state: AppState,
      actions: PayloadAction<{
        id: string;
        field: string;
        value: string | number;
      }>
    ) => {
      const { id, field, value } = actions.payload;
      state.carts.forEach((cart, index) => {
        if (cart.product_id === id) {
          (
            state.carts[index] as {
              [x: string]: string | number | CartProduct["product"];
            }
          )[field] = value;
        }
      });

      Cookie.set("carts", JSON.stringify(state.carts), { expires: 365 });
    },
    setWish: (state: AppState, actions: PayloadAction<string>) => {
      state.wishlists.push(actions.payload);
    },
    removeWish: (state: AppState, actions: PayloadAction<string>) => {
      let product = state.wishlists.findIndex(
        (wish) => wish === actions.payload
      );
      state.wishlists.splice(product, 1);
    },
    setMode: (
      state: AppState,
      actions: PayloadAction<"light" | "dark" | "default">
    ) => {
      if (actions.payload === "default") {
        state.mode = getCurrentTheme();
      } else {
        state.mode = actions.payload;
      }

      state.theme = actions.payload;
      Cookie.set("theme", actions.payload);
    },
    auth: (state: AppState, actions: PayloadAction<AppState["user"]>) => {
      if (actions.payload) {
        state.user = actions.payload;
        state.loggedIn = !state.loggedIn;
      } else {
        state.user = null;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(
      addToCarts.fulfilled,
      (state, actions: PayloadAction<CartProduct>) => {
        state.carts.push(actions.payload);
        Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
      }
    );
    builder.addCase(updateCarts.fulfilled, (state, actions) => {
      const { cartid, cart } = actions.payload;
      state.carts.forEach((c, index) => {
        if (c.product_id === cartid) {
          (state.carts[index] as {
            [x: string]: string | number | CartProduct["product"];
          }) = { ...c, ...cart };
        }
      });

      Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
    });
    builder.addCase(deleteCart.fulfilled, (state, actions) => {
      let product = state.carts.findIndex(
        (cart) => cart.product_id === actions.payload.cartid
      );
      state.carts.splice(product, 1);
      Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
    });
    builder.addCase(setAllCarts.fulfilled, (state, actions) => {
      state.carts = actions.payload;
      Cookie.set("carts", JSON.stringify(state.carts), { expires: 30 });
    });
  },
});

export const {
  setCart,
  removeCart,
  setAllCart,
  updateCart,
  setWish,
  removeWish,
  setMode,
  auth,
} = Shop.actions;

export const cartLengths = (state: RootState) => state.shop.carts;
export const wishLists = (state: RootState) => state.shop.wishlists;

export default Shop.reducer;
