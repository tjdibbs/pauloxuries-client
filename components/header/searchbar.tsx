import React, { SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import ProductStyle2 from "../productStyle2";
import { Product } from "@lib/types";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";

const SearchBar: React.FC<{
  open: boolean;
  setOpenSearch: React.Dispatch<SetStateAction<boolean>>;
}> = ({ open, setOpenSearch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ search: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [product, setProduct] = React.useState<Product[]>([]);
  const router = useRouter();

  const handleSearch = async (search: string) => {
    try {
      if (!search) {
        setProduct([]);
        return;
      }
      setLoading(true);
      const req = await axios.get<{ success: boolean; products: Product[] }>(
        "/api/products/search?search=" + search
      );
      const { success, products } = await req.data;
      if (success) {
        setProduct(products);
        setLoading(false);
        return;
      }

      enqueueSnackbar("Internal Server Error", {
        variant: "error",
      });
      setLoading(false);
    } catch (e) {
      enqueueSnackbar("There is problem fetching search products", {
        variant: "error",
      });
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) document.body.classList.add("searching");
    else document.body.classList.remove("searching");

    router.events.on("routeChangeStart", () => setOpenSearch(false));

    return () => {
      router.events.off("routeChangeStart", () => setOpenSearch(false));
      document.body.classList.remove("searching");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence exitBeforeEnter={true} initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
            width: "100vw",
            backgroundColor: "rgba(0,0,0,.8)",
            display: "flex",
            alignItems: "center",
            zIndex: 1000000,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
            }}
            style={{
              maxWidth: "90%",
              height: "max-content",
              maxHeight: "90%",
              overflow: "auto",
              margin: "auto",
              width: 700,
            }}
            exit={{ scale: 0 }}
          >
            <Paper
              className={"searchbar-wrapper"}
              sx={{
                // px: 2,
                overflow: "hidden",
              }}
            >
              <Paper
                elevation={0}
                component={"form"}
                sx={{
                  position: "sticky",
                  py: 2,
                  top: 0,
                  zIndex: 1000,
                  px: 1,
                  mb: 3,
                }}
              >
                <TextField
                  size={"small"}
                  label={"Brand, product, class"}
                  fullWidth
                  autoFocus={true}
                  sx={{ flexGrow: 1 }}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position={"end"}>
                        <IconButton
                          size={"small"}
                          sx={{
                            bgcolor: "background.main",
                          }}
                          onClick={() => {
                            setOpenSearch(false);
                            setProduct([]);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>
              {!loading && Boolean(product?.length) && (
                <React.Fragment>
                  <Typography variant={"subtitle1"} textAlign={"center"} mb={2}>
                    Search Results
                  </Typography>
                  <motion.div
                    layout
                    className={"search-result"}
                    style={{
                      // display: "flex",
                      // justifyContent: "center",
                      // flexWrap: "wrap",
                      // gap: "1em",
                      paddingBottom: "2em",
                    }}
                  >
                    <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ px: 1 }}>
                      {product.map((item, index) => {
                        return (
                          <Grid item xs={6} sm={4} key={index}>
                            <motion.div
                              layout
                              initial={{
                                scale: 0.6,
                                opacity: 0.6,
                              }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                              }}
                              style={{
                                maxWidth: 300,
                                margin: "auto",
                              }}
                            >
                              <ProductStyle2
                                item={item}
                                xs={200}
                                sm={250}
                                md={250}
                                component={"div"}
                              />
                            </motion.div>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </motion.div>
                </React.Fragment>
              )}

              {loading && (
                <Box
                  sx={{
                    width: "100%",
                    height: 150,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Paper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
