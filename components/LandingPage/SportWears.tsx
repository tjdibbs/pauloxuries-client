import React from "react";
import Product from "../product";
import AliceCarousel from "react-alice-carousel";
import { Typography, Box, Divider } from "@mui/material";
import type { Product as ProductType } from "@lib/types";
import ProductStyle2 from "@comp/productStyle2";
import Loading from "@comp/loading";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { breakpoints, BASE_URL } from "@lib/constants";
import { nanoid } from "nanoid";
import axios from "axios";
const responsive = {
  0: { items: 2 },
  568: { items: 3 },
  800: { items: 4 },
  1024: { items: 5 },
};

export default function SportWears() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [sportWears, setSportWears] = React.useState<ProductType[]>([]);

  React.useEffect(() => {
    axios
      .get<{ products: ProductType[] }>( "/api/products/sport")
      .then((response) => {
        if (!response.data.products) return;

        setSportWears(response.data.products);
        setLoading(false);
      });
  }, []);

  if (loading || !sportWears?.length) return <></>;

  return (
    <React.Fragment>
      <Divider className="font-bold text-xl"> Sports </Divider>
      <Box sx={{ flexGrow: 1 }}>
        <Splide
          options={{
            perMove: 1,
            mediaQuery: "min",
            breakpoints
          }}
          className="max-lg:px-0 px-2 py-6"
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
            : sportWears.map((product) => {
                return (
                  <SplideSlide key={product.id}>
                    <Product item={product} />
                  </SplideSlide>
                );
              })}
        </Splide>
      </Box>
    </React.Fragment>
  );
}
