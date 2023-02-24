import React from "react";
import Product from "../product";
import AliceCarousel from "react-alice-carousel";
import { Typography, Box, Divider } from "@mui/material";
import type { Product as ProductType } from "@lib/types";
const responsive = {
  0: { items: 2 },
  568: { items: 3 },
  800: { items: 4 },
  1024: { items: 5 },
};

export default function Category(props: { jerseys: string }) {
  const [jerseys, setJerseys] = React.useState<ProductType[]>(
    JSON.parse(props.jerseys ?? "[]")
  );

  return (
    <React.Fragment>
      {Boolean(jerseys.length) && (
        <Box mb={4}>
          <Divider>
            <Typography variant={"h6"} fontWeight={800}>
              Jerseys From Adidas
            </Typography>
          </Divider>
        </Box>
      )}
      <AliceCarousel
        mouseTracking
        disableButtonsControls
        disableDotsControls
        items={jerseys.map((item, index) => {
          return <Product item={item} key={item.id} />;
        })}
        responsive={responsive}
        controlsStrategy={"alternate"}
        infinite={false}
      />
    </React.Fragment>
  );
}
