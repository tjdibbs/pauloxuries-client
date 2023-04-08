export interface Product {
  id: string;
  title: string;
  userid: string;
  rating: number;
  reviews: number;
  images: string;
  thumbnail?: string;
  stock: number;
  sold: number;
  createdAt: string;
  price: string;
  discountPercentage: string;
  sizes: string;
  colors: string;
}

export type Order = Checkout &
  SavedAddress & {
    name: string;
    email: string;
    paymentMethod: "pay-on-delivery" | "transfer";
    amount?: number;
    update?: boolean;
    subscribe: boolean;
    create: boolean;
    other: string;
    agree: boolean;
    additionalInformation: string;
    user: Pick<User, "image" | "firstname" | "lastname" | "email" | "id">;
  };

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  image: string;
  admin: boolean;
  carts: CartProduct[];
  wishlist: string[];
  verified: boolean;
  password: string;
  savedAddress: string[];
}

export type CartProduct = {
  id: string;
  product: {
    id: string;
    title: string;
    price: number | string;
    image: string;
    discountPercentage: number | null;
    stock: number;
    sold: number;
  };
  quantity: number;
  sizes: string;
  colors: string;
  status?: string;
};

export interface SavedAddress {
  city: string;
  state: string;
  country: string;
  address: string;
  phone: number;
}

export type FormDataType = {
  userid: string;
  title: string;
  price: string;
  description: string;
  discountPercentage: string;
  frontImage: FileList;
  backImage: FileList;
  additionalImage: FileList;
  brand: string;
  stock: string;
  category: string;
  sizes: string;
  colors: string;
};

export interface Cart {
  id: string;
  product: Partial<Product>;
  user: string;
  size: string | null;
  quantity: number;
}

export interface Checkout {
  cart: CartProduct[];
  total: number;
  discountedTotal: number;
  totalPrice: number;
}

export interface Review {
  userid: string;
  name: string;
  image: string;
}
