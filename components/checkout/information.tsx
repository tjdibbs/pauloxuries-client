import React from "react";
import { Cart, CartProduct, OrderType, Product } from "@lib/types";
import { useForm } from "react-hook-form";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Collapse,
  Grid,
  MenuItem,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { countryList } from "@lib/country";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import axios from "axios";
import { useRouter } from "next/router";
import Cookie from "js-cookie";
import { useSnackbar } from "notistack";
import { setAllCart } from "@lib/redux/reducer";
import { setAllCarts } from "@lib/redux/cartSlice";
import { nanoid } from "nanoid";
import message from "lib/message";

interface InformationProps {
  checkout: Cart<CartProduct> | null;
  setCheckout: React.Dispatch<React.SetStateAction<Cart<CartProduct> | null>>;
  setDone: React.Dispatch<React.SetStateAction<boolean>>;
}

const Information = ({ checkout, setCheckout, setDone }: InformationProps) => {
  const formdata = JSON.parse(Cookie.get("formdata") ?? "{}");
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const SubmitBtn = React.useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [type, setType] = React.useState<string>("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [open, setOpen] = React.useState<boolean>(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<OrderType>({
    defaultValues: {
      ...formdata,
      save: formdata.save === true ? "on" : "off",
    },
  });

  const { user, carts } = useAppSelector((state) => state.shop);

  if (!checkout) {
    return (
      <Paper sx={{ p: 3, width: "100%", borderRadius: "20px" }}>
        <Typography variant={"subtitle2"} my={2}>
          There is no product to checkout
        </Typography>
        <Link href={"/collections"}>
          <Button
            variant={"contained"}
            sx={{ textTransform: "none", borderRadius: "20px" }}
          >
            Go to shop
          </Button>
        </Link>
      </Paper>
    );
  }

  const { paymentMethod, country_region } = watch();

  const onSubmit = (data: OrderType) => {
    if (!user) {
      Cookie.set("formdata", JSON.stringify(data), {
        expires: new Date(Date.now() + 1000 * 60 * 60),
      });
      router.push("/sign-in?redirect=" + router.asPath);
      return;
    }

    setLoading(true);
    let formatData: Partial<OrderType> = {};

    (Object.keys(data) as [x: keyof OrderType]).forEach((key, index) => {
      if (data[key]) {
        (formatData[key] as string) = data[key] as string;
      }
    });

    const formData = {
      user: {
        userid: user!.id,
        firstname: user!.firstname,
        lastname: user!.lastname,
        email: user!.email,
      },
      checkout: checkout,
      ...formatData,
    };

    if (!formData.paymentMethod) {
      enqueueSnackbar("Please select paymentMethod", { variant: "error" });
      setLoading(false);
      return;
    }

    axios
      .post("/api/checkout", formData)
      .then(({ data }) => {
        if (data.success) {
          reset();
          message(enqueueSnackbar, "Order completed", "success");

          let newCarts = carts.filter((cart) => {
            let checkOrder = checkout!.products.findIndex(
              ({ product_id }) => product_id === cart.product_id
            );
            return checkOrder === -1;
          });
          dispatch(setAllCarts({ userid: user?.id, carts: newCarts })).then(
            () => {
              setDone(true);
              setCheckout(null);
              Cookie.remove("checkout");
              Cookie.remove("formdata");
            }
          );
        }

        if (data.type) {
          enqueueSnackbar(
            <Box sx={{ maxWidth: 400 }}>
              <p>{data.type}</p>
              <p>
                Some of the products is out of stock or over stake, Please clear
                your carts and select products again
              </p>
            </Box>,
            {
              variant: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
            }
          );
        }

        setLoading(false);
      })
      .catch((e: EvalError) => {
        message(enqueueSnackbar, e.message, "error");

        setLoading(false);
      });
  };

  const handlePayment = (value: "pay-on-delivery" | "transfer") => {
    let values: OrderType;
    switch (value) {
      case "pay-on-delivery":
        // @ts-ignore
        values = getValues;
        delete values.transaction_id;
        delete values.bank_name;
        delete values.account_name;
        delete values.amount;

        reset({ ...values, paymentMethod: value });
        break;
      case "transfer":
        reset({
          ...getValues,
          paymentMethod: value,
          transaction_id: nanoid(),
          // @ts-ignore
          amount: checkout.totalPrice.toLocaleString(),
        });
    }
  };

  return (
    <Box
      className={"checkout-information"}
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
      flexGrow={1}
    >
      <Box className={"form-group"}>
        <Typography variant={"subtitle1"} mb={2} fontWeight={600}>
          Shipping Address
        </Typography>
        <Box className="form-group">
          <TextField
            fullWidth
            className={"form-control"}
            label={"Country/Region"}
            select
            value={country_region ?? "Nigeria"}
            size={"small"}
            {...register("country_region", {
              required: true,
              onChange: (e) => setValue("country_region", e.target.value),
            })}
          >
            {countryList.map((country) => {
              return (
                <MenuItem key={country.code} value={country.name}>
                  {country.name}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
        <Grid container spacing={{ xs: 0, sm: 1, md: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box className="form-group">
              <TextField
                className={"form-control"}
                fullWidth
                label={"City"}
                size={"small"}
                margin={"dense"}
                {...register("city", {
                  required: true,
                })}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box className="form-group">
              <TextField
                className={"form-control"}
                fullWidth
                label={"State"}
                size={"small"}
                margin={"dense"}
                {...register("state", {
                  required: true,
                })}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box className="form-group">
              <TextField
                fullWidth
                className={"form-control"}
                label={"Phone"}
                size={"small"}
                margin={"dense"}
                {...register("phone", {
                  required: true,
                })}
              />
            </Box>
          </Grid>
        </Grid>
        <Box className="form-group" mb={2}>
          <TextField
            className={"form-control"}
            label={"Street No. & Name"}
            size={"small"}
            margin={"dense"}
            {...register("address", {
              required: true,
            })}
            fullWidth
          />
        </Box>
      </Box>
      <Box className={"payment-method"}>
        <Typography fontWeight={700} mb={1}>
          Payment Method
        </Typography>
        <Stack direction={"row"} gap={1}>
          <Button
            size={"small"}
            className={
              paymentMethod === "pay-on-delivery" ? " bg-primary-low" : ""
            }
            variant={
              paymentMethod == "pay-on-delivery" ? "contained" : "outlined"
            }
            color={"primary"}
            onClick={() => handlePayment("pay-on-delivery")}
          >
            Pay on delivery
          </Button>
          <Button
            size={"small"}
            className={paymentMethod === "transfer" ? " bg-primary-low" : ""}
            variant={paymentMethod === "transfer" ? "contained" : "outlined"}
            color={"primary"}
            onClick={() => handlePayment("transfer")}
          >
            Make transfer now
          </Button>
        </Stack>
        <Collapse in={paymentMethod === "transfer"} sx={{ mt: 3 }}>
          <Paper sx={{ p: 1, mb: 1 }}>
            <Typography variant={"subtitle2"}>
              Transfer to this account
            </Typography>
            <ul>
              <li>
                <Typography variant={"caption"}>Bank name - Gt Bank</Typography>
              </li>
              <li>
                <Typography variant={"caption"}>
                  Account no - 0561649884
                </Typography>
              </li>
              <li>
                <Typography variant={"caption"}>
                  Account name - Pauloxuries Store
                </Typography>
              </li>
              <li>
                <Typography variant={"caption"}>
                  Note: Goods will be delivered after transaction is confirmed
                  and verified.
                </Typography>
              </li>
              <li>
                <Typography variant={"subtitle2"}>
                  Please copy and paste the transaction as the transfer
                  description for unique identification
                </Typography>
              </li>
            </ul>
          </Paper>
          {paymentMethod === "transfer" && (
            <Box className={"transfer-info"}>
              <Typography fontWeight={700} mb={2}>
                Transfer Details
              </Typography>
              <Grid container spacing={{ xs: 1.5 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size={"small"}
                    label={"Transaction Id"}
                    {...register("transaction_id", {
                      required: true,
                    })}
                    helperText={
                      "Enter this text as the transfer description for identification"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size={"small"}
                    label={"Bank name"}
                    {...register("bank_name", {
                      required: true,
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size={"small"}
                    label={"Account name"}
                    {...register("account_name", {
                      required: true,
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    {...register("amount", {
                      required: true,
                      onChange: (e) => {
                        let value = parseInt(
                          e.target.value.replaceAll(/\D/g, "")
                        );
                        setValue(
                          "amount",
                          // @ts-ignore
                          isNaN(value) ? "" : String(value.toLocaleString())
                        );
                      },
                      setValueAs: (value: string) =>
                        isNaN(parseInt(value))
                          ? ""
                          : typeof value !== "number"
                          ? parseInt(value?.replaceAll(/\D/g, ""))
                          : value,
                    })}
                    fullWidth
                    size={"small"}
                    label={"Amount"}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Collapse>
      </Box>
      <button
        className="btn bg-primary-low text-white mt-4"
        type={"submit"}
        disabled={loading}
        ref={SubmitBtn}
      >
        {loading && <CircularProgress size={18} />}
        <span style={{ marginLeft: 10 }}>Submit Order</span>
      </button>

      {/* <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ display: "grid", height: "100vh", placeItems: "center" }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ position: "absolute", top: "20px", right: "20px" }}
          >
            Close
          </Button>
          <Box>
            <Typography variant={"h6"}>Some Product Are {type}</Typography>
            <Paper
              className="over_stake_out_of_stock"
              sx={{
                p: 5,
                bgcolor: theme.palette.mode == "light" ? "whitesmoke" : "grey",
              }}
            >
              <Stack spacing={3}>
                {products.map((product, index) => {
                  return (
                    <Card key={index}>
                      <CardHeader avatar={<Avatar src={product.images[0]} />} />
                    </Card>
                  );
                })}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Modal> */}
    </Box>
  );
};

export default Information;
