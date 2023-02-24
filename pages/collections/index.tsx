import React from "react";
import { GetServerSideProps, NextPage } from "next";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import Link from "next/link";
import Filter from "@comp/filter";
import { ArrowForwardIosRounded } from "@mui/icons-material";
import { AppState, Product } from "@lib/types";
import { fetchProducts } from "../../server/routes/getProducts";
import RenderProducts from "@comp/renderProducts";
import { getUser } from "server/routes/router";
import FetchCartsHook from "@comp/fetchCartsHook";
import SEO from "@comp/seo";
import Viewed from "@comp/viewed";

type Props = Partial<{
  products: string;
  error: boolean;
  message: string;
  user: AppState["user"];
}>;

const pageDescription = {
  title: "Fashion Wears Collections",
  description:
    "Having a collection of fashion wears from variety of brands. Find unique wears to make you stand out. We provide everything fashion",
  url: "https://pauloxuries.com/collections",
  image: "https://pauloxuries.com/images/metadata/collection.jpg",
};

const Collections: NextPage<Props> = (props) => {
  const [products, setProducts] = React.useState<Product[]>(
    JSON.parse(props.products ?? "[]") ?? []
  );

  if (props.error) {
    return (
      <React.Fragment>
        <SEO {...pageDescription} />
        <Container sx={{ p: 0 }} className="component-wrap">
          <Paper sx={{ p: 3, my: 3 }}>
            <Typography variant={"subtitle2"} my={2}>
              Internal Server Error Occur
            </Typography>
            <Button
              variant={"contained"}
              sx={{ textTransform: "none" }}
              onClick={() => window?.location.reload()}
            >
              Reload Page
            </Button>
          </Paper>
        </Container>
      </React.Fragment>
    );
  }

  FetchCartsHook({ user: props.user, loading: false, setLoading: () => null });

  return (
    <React.Fragment>
      <SEO {...pageDescription} />
      <Container maxWidth={"xl"} sx={{ p: 0 }} className="component-wrap">
        <Box className={"breadcrumbs-wrapper"} my={3}>
          <Breadcrumbs
            separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
          >
            <Link href={"/"}>
              <Typography sx={{ cursor: "pointer" }} variant={"subtitle2"}>
                Home
              </Typography>
            </Link>
            <Link href={"/collections"}>
              <Typography variant={"subtitle2"}>Collections</Typography>
            </Link>
          </Breadcrumbs>
        </Box>
        <Box className="filter-wrapper">
          <Filter products={products} />
          <Divider />
        </Box>
        {products.length > 0 ? (
          <RenderProducts products={products} />
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant={"subtitle1"} mb={2}>
              No product found
            </Typography>
            <Link href={"/collections"}>
              <Button variant={"contained"} size={"small"}>
                Go back
              </Button>
            </Link>
          </Paper>
        )}

        <Viewed />
      </Container>
    </React.Fragment>
  );
};

export default Collections;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { success, products } = await fetchProducts();
  const query = ctx.query;

  //@ts-ignore
  const user = ctx.req.session.user ?? null;

  return {
    props: {
      ...(success ? { products: JSON.stringify(products) } : { error: true }),
      user,
    },
  };
};
