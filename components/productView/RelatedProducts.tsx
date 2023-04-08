import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import { BASE_URL, breakpoints } from "@lib/constants";
import Loading from "@comp/loading";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { nanoid } from "nanoid";
import { useAppSelector } from "@lib/redux/store";

export default function RelatedProduct({
  brand,
  title,
  id,
  category,
}: {
  id: string;
  brand: string;
  title: string;
  category: string;
}) {
  const [related, setRelated] = React.useState<Product[]>([]);
  const { cart, wishlist, user } = useAppSelector((state) => state.shop);

  React.useEffect(() => {
    axios
      .get<{ success: boolean; products: Product[] }>(
        BASE_URL + `/api/products/related?category=${category}`
      )
      .then((response) => {
        let { success, products } = response.data;
        if (success) {
          products = products.filter((product) => product.id !== id);
          setRelated(products);
        }
      });
  }, [brand, id, title, category]);

  if (!related?.length) return <></>;

  return (
    <Box my={15}>
      <Typography variant={"h6"} fontWeight={700}>
        Related Products
      </Typography>
      <Box sx={{ flexGrow: 1, my: 3 }}>
        <Splide
          options={{
            mediaQuery: "min",
            breakpoints,
            perMove: 1
          }}
          className="px-2 py-6"
        >
          {related.map((product) => {
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
      </Box>
    </Box>
  );
}
