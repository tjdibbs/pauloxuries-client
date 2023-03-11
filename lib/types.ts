import { sort } from "@comp/filter";

export type FilterState = {
  availability: string;
  price: {
    min: number;
    max: number;
  };
  color: string;
  size: number;
  type: string;
};

export type State = {
  availability: string;
  price: { max: number; min: number };
  size: number | null;
  color: string | null;
  type: string | null;
  sort: keyof typeof sort;
};

export type Product = {
  id: string;
  userid: string;
  rating: number;
  reviews?: object[];
  images: string;
  thumbnail?: string;
  sold: number;
  sizes: { [x: string]: string | number };
  colors: { [x: string]: string };
  createdAt: string;
} & Omit<FormDataType, "frontImage" | "backImage" | "additionalImage">;

export type ProductProp = {
  item: Product;
};

export interface SavedAddress {
  city: string;
  state: string;
  country_region: string;
  address: string;
  phone: number;
}
export interface OrderType extends SavedAddress {
  paymentMethod: "pay-on-delivery" | "transfer";
  transaction_id?: string;
  bank_name?: string;
  account_name?: string;
  amount?: number;
  save?: boolean;
  checkout: Cart<CartProduct>;
}

export type FormDataType = {
  title: string;
  price: number | string;
  description: string;
  discountPercentage: number;
  frontImage: FileList;
  backImage: FileList;
  additionalImage: FileList;
  brand: string;
  stock: number;
  category: string;
  sizes: string;
  colors: string;
};

export type FileType = {
  _id: string;
  filename: string;
  type: string;
  views?: number;
};

export type Response = Partial<{
  success: boolean | null;
  loading: boolean;
  message: string;
  uploaded: boolean;
  error: string;
}>;

export interface RouterQuery {
  brand: string;
  sort: string;
  categories: string;
  colors: string;
  availability: string;
  sizes: string;
  price: string;
}

export type AppState = {
  mode: "light" | "dark";
  theme: "default" | "light" | "dark";
  carts: Partial<CartProduct>[];
  wishlist: string[];
  device: "mobile" | "desktop";
  loggedIn: boolean;
  user?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    image: string;
    admin: boolean;
    carts: string[];
    wishLists: string[];
    verified: boolean;
  } | null;
};

export type CartProduct = {
  id: string;
  user: string;
  product: Partial<{
    id: string;
    title: string;
    price: number | string;
    image: string;
    discountPercentage: number | null;
    stock: number;
    sold: number;
  }>;
  quantity: number;
  sizes: (string | number)[];
  colors: string[];
};

export type Cart<T> = {
  products: T[];
  total: number;
  discountedTotal: number;
  totalPrice: number;
  totalQuantity: number;
};
