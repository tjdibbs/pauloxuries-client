import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Cookies from "js-cookie";
import ProductStyle2 from "./productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import { useSnackbar } from "notistack";
import Loading from "./loading";
import AliceCarousel from "react-alice-carousel";
import { Divider, Typography } from "@mui/material";

const responsive = {
  0: { items: 2 },
  568: { items: 3 },
  800: { items: 4 },
  1024: { items: 5 },
};

export default function Viewed({ id }: { id?: string }) {
  const [viewed, setViewed] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let _viewed = Cookies.get("viewed");
    setViewed(
      (JSON.parse(_viewed ?? "[]") as Product[]).filter((p) => p.id !== id)
    );
    setLoading(false);
  }, [id]);

  return (
    <Box sx={{ flexGrow: 1, my: 5 }}>
      <Box my={4}>
        <Divider>
          <Typography variant="h6">What you recently view</Typography>
        </Divider>
      </Box>
      {!loading && (
        <AliceCarousel
          mouseTracking
          disableButtonsControls
          disableDotsControls
          items={
            loading
              ? Array.from(new Array(4)).map((i) => (
                  <Loading component="div" key={i} />
                ))
              : viewed?.map((item, index) => (
                  <Box mr={0.5} key={index} maxWidth={{ xs: 200, sm: 250 }}>
                    <ProductStyle2 item={item} component="div" />
                  </Box>
                ))
          }
          responsive={responsive}
          controlsStrategy={"alternate"}
          infinite={false}
        />
      )}
    </Box>
  );
}
