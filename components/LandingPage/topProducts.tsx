import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import { useSnackbar } from "notistack";
import Loading from "../loading";
import AliceCarousel from "react-alice-carousel";
import { Pagination } from "swiper";
import { SwiperSlide, Swiper } from "swiper/react";

const responsive = {
  0: { items: 2 },
  568: { items: 3 },
  800: { items: 4 },
  1024: { items: 5 },
};

export default function TopProducts() {
  const [topProducts, setTopProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    axios
      .get<{ success: boolean; products: Product[] }>("/api/products/top")
      .then((response) => {
        const { success, products } = response.data;
        if (success) {
          setTopProducts(products);
          setLoading(false);
          return;
        }

        enqueueSnackbar("Internal Server Error", {
          variant: "error",
        });
      })
      .catch(() => {
        enqueueSnackbar("There is problem fetching search products", {
          variant: "error",
        });
      });
  }, [enqueueSnackbar]);

  return (
    <Box sx={{ flexGrow: 1, my: 5 }}>
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
        }}
        className="px-2 py-6"
      >
        {loading
          ? Array.from(new Array(4)).map((i) => (
              <SwiperSlide key={i}>
                <Loading />
              </SwiperSlide>
            ))
          : topProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductStyle2 item={product} component="div" />
              </SwiperSlide>
            ))}
      </Swiper>
    </Box>
  );
}

export const itemData = [
  {
    _id: "1",
    img: "/images/daco.png",
    title: "Doco Image",
    description: "from chicago",
    price: 140300,
  },
  {
    _id: "2",
    img: "/images/female-shoe.png",
    title: "Ladies Shoes",
    description: "from chicago",
    price: 140300,
  },
  {
    _id: "3",
    img: "/images/daco.png",
    title: "Doco Image",
    description: "from chicago",
    price: 140300,
  },
  {
    _id: "4",
    img: "/images/daco.png",
    title: "Ladies Shoes",
    description: "from chicago",
    price: 140300,
  },
];
