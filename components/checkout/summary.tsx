import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Cart, CartProduct } from "@lib/types";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

const ShippingSummary = ({
  checkout,
}: {
  checkout: Cart<CartProduct> | null;
}) => {
  const [width, setWidth] = React.useState<boolean>(false);

  React.useEffect(() => {
    setWidth(window.innerWidth >= 900);

    const handleResize = () => {
      if (window.innerWidth >= 900) setWidth(true);
      else setWidth(false);
    };

    window.onresize = handleResize;
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!checkout) return <></>;

  return (
    <Box
      className={"summary"}
      minWidth={{ sm: "100%", md: 400 }}
      maxWidth={"100%"}
    >
      <Paper sx={{ p: 1, mb: 1.5, borderRadius: "20px" }}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
        >
          <Box
            className={"summary-toggle"}
            onClick={() => setWidth(!width)}
            sx={{ cursor: "pointer" }}
          >
            <IconButton>
              {width ? (
                <KeyboardArrowUpRoundedIcon />
              ) : (
                <KeyboardArrowDownRoundedIcon color={"info"} />
              )}
            </IconButton>
            <Typography
              component={"span"}
              variant={"subtitle2"}
              color={"info.main"}
            >
              Show Order Summary
            </Typography>
          </Box>
          <Box className={"order-total-price"}>
            <Chip label={"#" + checkout.totalPrice.toLocaleString("en")} />
          </Box>
        </Stack>
      </Paper>
      <Collapse in={width}>
        <Stack spacing={1}>
          {checkout.products?.map((cart, i) => {
            return (
              <Card key={i} sx={{ p: 1, borderRadius: "20px" }}>
                <CardHeader
                  avatar={
                    <Badge badgeContent={cart.quantity} color={"info"}>
                      <Avatar
                        variant={"rounded"}
                        src={
                          cart.product!.image.indexOf("http") !== -1
                            ? cart.product!.image
                            : "/images/products/" + cart.product!.image
                        }
                      >
                        <ShoppingCartCheckoutIcon />
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <Typography
                      variant={"body1"}
                      fontWeight={600}
                      lineHeight={1.3}
                    >
                      {cart.product!.title}
                    </Typography>
                  }
                  subheader={"Size - 40"}
                  action={
                    <Chip
                      label={
                        "#" +
                        (
                          (cart.product!.price as number) * cart.quantity
                        ).toLocaleString("en")
                      }
                    />
                  }
                />
              </Card>
            );
          })}
        </Stack>
        <Box role={"application"} p={2}>
          <Box id={"total-price"}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant={"subtitle2"}>Total Price</Typography>
              <Typography variant={"subtitle1"} fontWeight={600}>
                #{checkout.total.toLocaleString("en")}
              </Typography>
            </Stack>
          </Box>
          <Box id={"discount"} width={"100%"}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant={"subtitle2"}>Discount</Typography>
              <Typography variant={"subtitle1"} fontWeight={600}>
                #{checkout.discountedTotal.toLocaleString("en")}
              </Typography>
            </Stack>
          </Box>
          <Box id={"total"} width={"100%"} my={1}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography
                variant={"subtitle1"}
                fontWeight={800}
                color={"primary.light"}
              >
                Total:{" "}
              </Typography>
              <Typography variant={"subtitle1"} fontWeight={800}>
                #{checkout.totalPrice.toLocaleString("en")}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(ShippingSummary);
