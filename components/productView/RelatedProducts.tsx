import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import { BASE_URL } from "@lib/constants";

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
        <Grid container spacing={{ xs: 1, md: 3 }}>
          {related.map((item, index) => (
            <ProductStyle2
              key={index}
              item={item}
              inCart={-1}
              inWishlist={false}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
