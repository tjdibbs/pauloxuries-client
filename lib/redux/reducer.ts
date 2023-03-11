import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { AppState, CartProduct, Product } from "../types";
import Cookie from "js-cookie";
import { CartBuilder } from "./cartSlice";
import getCurrentTheme from "lib/getCurrentTheme";
import { wishBuilder } from "./wishSlice";

const carts = Cookie.get("carts");
const wishlist = Cookie.get("wishlist");
const theme = Cookie.get("theme") as "light" | "dark" | "default";
const mode = "light";

const initialState: AppState = {
  // @ts-ignore
  mode,
  carts: JSON.parse(carts ?? "[]"),
  theme: theme ?? "default",
  wishlist: JSON.parse(wishlist ?? "[]"),
  loggedIn: false,
  device: "mobile",
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
        (cart) => cart.id === actions.payload
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
        if (cart.id === id) {
          (
            state.carts[index] as {
              [x: string]: string | number | CartProduct["product"];
            }
          )[field] = value;
        }
      });

      Cookie.set("carts", JSON.stringify(state.carts), { expires: 365 });
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
        state.user = {
          ...actions.payload,
          carts: JSON.parse(actions.payload.carts as unknown as string),
        };
        state.loggedIn = !state.loggedIn;
      } else {
        state.user = null;
      }
    },
  },
  extraReducers(builder) {
    // @reference react-toolkit async-thunk
    CartBuilder(builder);
    wishBuilder(builder);
  },
});

export const { setCart, removeCart, setAllCart, updateCart, setMode, auth } =
  Shop.actions;

export const cartLengths = (state: RootState) => state.shop.carts;

export default Shop.reducer;
