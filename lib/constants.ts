import { SwiperOptions } from "swiper";

export const breakpoints = {
  0: {
    perPage: 2,
    gap: 5,
  },
  768: {
    perPage: 4,
    gap: 10,
  },
  1024: {
    perPage: 4,
    gap: 10,
  },
};

export const BASE_URL = process.env.BASE_URL;
// process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

export enum Events {
  FILTERED = "FilteredProductsEvent",
  FILTER = "filterEvent",
  SORT = "SortEvent",
  NEW_PRODUCTS = "Products",
}

export const isProduction = process.env.NODE_ENV === "production";
export const domain =
  process.env.NODE_ENV === "production"
    ? "https://pauloxuries.com"
    : "http://localhost:3000";

// environment variables
export const SECRET_KEY = process.env.SECRET_KEY as string;
export const dev = process.env.NODE_ENV !== "production";
export const whitelist = [
  "http://localhost:3000",
  "https://pauloxuries.com",
  "https://bb84-102-89-43-228.eu.ngrok.io",
];

export enum STATUS {
  OK = 200,
  CREATED = 201,
  ACCEPTED,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
