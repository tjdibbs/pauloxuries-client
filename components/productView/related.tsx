import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";

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
        `/api/products/related?category=${category}`
      )
      .then((response) => {
        let { success, products } = response.data;
        if (success) {
          products = products.filter((product) => product.id !== id);
          setRelated(products);
        }
      });
  }, [brand, id, title, category]);

  return (
    <Box my={15}>
      <Typography variant={"h6"} fontWeight={700}>
        Related Products
      </Typography>
      <Box className="related-products">
        {!Boolean(related.length) && (
          <Box
            sx={{
              border: "1px solid",
              p: { xs: 3, sm: 5 },
              mt: 3,
              borderRadius: "10px",
              bgcolor: "#f6f0f4",
            }}
          >
            <Typography color="#000">No related Products</Typography>
          </Box>
        )}
        <Box sx={{ flexGrow: 1, my: 3 }}>
          <Grid container spacing={{ xs: 1, md: 3 }}>
            {related.map((item, index) => (
              <ProductStyle2 key={index} item={item} />
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
