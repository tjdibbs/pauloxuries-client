import React from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import useStyles from "@lib/styles";
import Product from "../product";
import { Product as ProductType } from "@lib/types";
import axios from "axios";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import Loading from "../loading";
import { Typography } from "@mui/material";

export default function App() {
  const styles = useStyles();

  const [hotBrand, setHotBrand] = React.useState<ProductType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    axios
      .get<{ success: boolean; products: ProductType[] }>(
        "/api/products?limit=12"
      )
      .then((response) => {
        const { success, products } = response.data;
        if (success) {
          setHotBrand(products);
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

  return hotBrand?.length ? (
    <Splide
      className="mySplide"
      style={{ paddingBottom: 50 }}
      options={{
        perMove: 1,
        mediaQuery: "min",
      }}
    >
      {loading
        ? Array(4).map((i) => (
            <SplideSlide key={i}>
              <Loading />
            </SplideSlide>
          ))
        : hotBrand.map((item, index) => {
            return (
              <SplideSlide className={styles.swiper_slide} key={index}>
                <Product item={item} />
              </SplideSlide>
            );
          })}
    </Splide>
  ) : (
    <Typography variant={"subtitle2"}>There is new product</Typography>
  );
}
