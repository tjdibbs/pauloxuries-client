import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import Loading from "../loading";
// import { Pagination } from "swiper";
// import { SwiperSlide, Swiper } from "swiper/react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { BASE_URL, breakpoints } from "@lib/constants";
import useMessage from "@hook/useMessage";
import { nanoid } from "nanoid";
import { useAppSelector } from "@lib/redux/store";

const responsive = {
  0: { items: 2 },
  568: { items: 3 },
  800: { items: 4 },
  1024: { items: 5 },
};

export default function TopProducts() {
  const [topProducts, setTopProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { alertMessage } = useMessage();

  const { cart, wishlist, user } = useAppSelector((state) => state.shop);

  React.useEffect(() => {
    axios
      .get<{ success: boolean; products: Product[] }>(
        BASE_URL + "/api/products/top"
      )
      .then((response) => {
        const { success, products } = response.data;
        if (success) {
          setTopProducts(products);
          setLoading(false);
        } else alertMessage("Internal Server Error", "error");
      })
      .catch(() => {
        alertMessage("There is problem fetching search products", "error");
      });
  }, [alertMessage]);

  return (
    <div className="flex-grow mb-10">
      <Splide
      options={{
        perMove: 1,
        mediaQuery: "min",
        breakpoints,
        pagination: false,
      }}
        className="px-2"
      >
        {loading
          ? Array.from(new Array(4)).map((i) => (
              <SplideSlide
                key={nanoid()}
                className={"max-w-[50%] sm:max-w-[300px]"}
              >
                <Loading />
              </SplideSlide>
            ))
          : topProducts.map((product) => {
              const inCart = cart.findIndex(
                (cart) => cart.product!.id === product.id
              );
              const inWishlist = wishlist.includes(product.id);

              return (
                <SplideSlide key={product.id}>
                  <ProductStyle2
                    item={product}
                    {...{ inCart, inWishlist }}
                    component="div"
                  />
                </SplideSlide>
              );
            })}
      </Splide>
    </div>
  );
}

// export const itemData = [
//   {
//     _id: "1",
//     img: "/images/daco.png",
//     title: "Doco Image",
//     description: "from chicago",
//     price: 140300,
//   },
//   {
//     _id: "2",
//     img: "/images/female-shoe.png",
//     title: "Ladies Shoes",
//     description: "from chicago",
//     price: 140300,
//   },
//   {
//     _id: "3",
//     img: "/images/daco.png",
//     title: "Doco Image",
//     description: "from chicago",
//     price: 140300,
//   },
//   {
//     _id: "4",
//     img: "/images/daco.png",
//     title: "Ladies Shoes",
//     description: "from chicago",
//     price: 140300,
//   },
// ];
