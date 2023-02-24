import React from "react";
import Product from "../product";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  A11y,
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
  Scrollbar,
} from "swiper";
import useStyles from "@lib/styles";
import { Button, Typography, useTheme } from "@mui/material";
import axios from "axios";
import type { Product as ProductType } from "@lib/types";
import Loading from "../loading";
import Grid from "@mui/material/Grid";
import AliceCarousel from "react-alice-carousel";
import { useAppSelector } from "@lib/redux/store";

const responsive = {
  0: { items: 2 },
  800: { items: 3 },
  1024: { items: 4 },
};

export default function NewArrivals() {
  const styles = useStyles();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [newArrivals, setNewArrivals] = React.useState<ProductType[]>([]);

  React.useEffect(() => {
    axios
      .get<{ products: ProductType[] }>("/api/products/new")
      .then((response) => {
        setNewArrivals(response.data.products);
        setLoading(false);
      });
  }, []);
  return (
    <>
      {newArrivals.length || loading ? (
        <AliceCarousel
          mouseTracking
          disableButtonsControls
          disableDotsControls
          items={
            loading
              ? Array.from(new Array(4)).map((i) => (
                  <Loading component="div" key={i} />
                ))
              : newArrivals.map((item, index) => {
                  return <Product item={item} key={item.id} />;
                })
          }
          responsive={responsive}
          controlsStrategy={"alternate"}
          infinite={false}
        />
      ) : (
        <div className="card text-center">
          <Typography variant={"subtitle2"}>There is no new product</Typography>
        </div>
      )}
    </>
  );
}
