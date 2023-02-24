/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { GetServerSideProps, NextPage } from "next";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  Divider,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import Link from "next/link";
import ProductContent from "@comp/productView/content";
import RelatedProduct from "@comp/productView/related";

import { AppState, CartProduct, Product } from "@lib/types";
import client from "../../server/connection/db";
import Cookies from "js-cookie";
import { auth } from "@lib/redux/reducer";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import merge from "@utils/merge";
import { setAllCarts } from "@lib/redux/cartSlice";
import { useRouter } from "next/router";
import { marked } from "marked";

// icons
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import FacebookRounded from "@mui/icons-material/FacebookRounded";
import Twitter from "@mui/icons-material/Twitter";
// import { WhatsappRounded } from "@mui/icons-material";

// components
import SEO from "@comp/seo";
import View from "@comp/productView";
import Viewed from "@comp/viewed";
import { Icon } from "@iconify/react";

type Props = Partial<{
  product: string;
  notfound: boolean;
  error: boolean;
  user: AppState["user"];
}>;

const Products: NextPage<Props> = (props) => {
  const { carts } = useAppSelector((state) => state.shop);
  const [loading, setLoading] = React.useState<boolean>(true);
  const dispatch = useAppDispatch();
  const router = useRouter();

  React.useEffect(() => {
    const FetchProductCarts = (userCarts?: CartProduct[]) => {
      let merged = carts;

      if (!userCarts?.length && !carts.length) {
        setLoading(false);
        return;
      }

      if (userCarts?.length) {
        merged = merge<CartProduct>([...carts, ...userCarts!]);
      }

      dispatch(setAllCarts({ userid: props.user!?.id, carts: merged })).then(
        () => {
          setLoading(false);
        }
      );
    };

    dispatch(auth(props.user));
    FetchProductCarts(
      // @ts-ignore
      JSON.parse(props.user!?.carts || "[]") as CartProduct[]
    );

    const viewed = JSON.parse(Cookies.get("viewed") ?? "[]") as Product[];
    let product = JSON.parse(props.product as string) as Product;
    let check = viewed.findIndex((d) => d.id === product.id) === -1;
    if (check) {
      Cookies.set("viewed", JSON.stringify([product, ...viewed]), {
        expires: 7,
      });
    }
  }, [dispatch, props.user]);

  React.useEffect(() => {
    document.body.scrollTo({ top: 0 });
  }, [router]);

  if (props.error) {
    return (
      <Container sx={{ py: 5, px: 2 }}>
        <Typography>Internal Server Error: Reload Page</Typography>
      </Container>
    );
  }

  if (!props.product) {
    return (
      <Container sx={{ py: 5, px: 2 }}>
        <Typography>The Product you are looking for is missing</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container
        sx={{
          py: 5,
          px: 2,
          display: "grid",
          placeItems: "center",
          height: "100%",
        }}
      >
        <Typography mb={2}>Loading...</Typography>
        <CircularProgress sx={{ height: 70, width: 70 }} />
      </Container>
    );
  }

  const product = JSON.parse(props.product) as Product;

  const pageDescription = {
    title: product.title,
    description: product.description,
    url: "https://pauloxuries.com" + router.asPath,
    image: "https://pauloxuries.com/images/products/" + product.images[0],
  };

  return (
    <div className="component-wrap">
      <SEO {...pageDescription} />
      <Box className={"breadcrumbs-wrapper"} my={3}>
        <Breadcrumbs
          separator={<ArrowForwardIosRounded sx={{ fontSize: 11 }} />}
        >
          <Link href={"/"} passHref>
            <span>Home</span>
          </Link>
          <Link href={"/collections"} passHref>
            <span>Collections</span>
          </Link>
          <Typography variant={"subtitle2"}>{product.title}</Typography>
        </Breadcrumbs>
      </Box>
      <div className="main-content">
        <Box className="title" mt={2}>
          <Typography
            textTransform="capitalize"
            variant={"h6"}
            fontWeight={800}
          >
            {product.title}
          </Typography>
          <Typography variant={"caption"}>
            See more from{" "}
            <Link href={"/collections/brand/" + product.brand}>
              <span className="text-xs text-primary-low">{product.brand}</span>
            </Link>
          </Typography>
        </Box>
        <div className="md:flex my-5">
          <div className="section-product md:w-[60%] sm:p-6">
            <View images={JSON.parse(product.images)} alt={product.title} />
          </div>
          <ProductContent product={product} />
        </div>
      </div>
      <Box>
        <Box className={"description"} maxWidth={"100%"}>
          <Typography variant={"subtitle1"} fontWeight={600} my={2}>
            Product Description
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: marked.parse(product.description),
            }}
          />
        </Box>
        <Box className="share">
          <p className="text-sm font-semibold">Share On Social Media</p>
          <Stack direction={"row"}>
            <a
              title="pauloxuries facebook link"
              target={"_blank"}
              rel={"noreferrer"}
              href={`https://www.facebook.com/sharer/sharer.php?u=https://pauloxuries.com${router.asPath};src=sdkpreparse`}
            >
              <IconButton>
                <FacebookRounded />
              </IconButton>
            </a>
            <a
              title="pauloxuries twitter link"
              href={
                "https://twitter.com/intent/tweet?text=" +
                "https://pauloxuries.com" +
                router.asPath
              }
            >
              <IconButton>
                <Twitter />
              </IconButton>
            </a>
            <a
              title="pauloxuries whatsapp link"
              href={
                "whatsapp://send?text=" +
                "https://pauloxuries.com" +
                router.asPath
              }
            >
              <IconButton>
                <Icon icon={"ic:outline-whatsapp"} />
              </IconButton>
            </a>
          </Stack>
        </Box>
      </Box>
      <Divider />
      <RelatedProduct
        brand={product.brand}
        category={product.category}
        title={product.title}
        id={product.id}
      />
      <Viewed id={product.id} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    // @ts-ignore
    const user = req.session.user ?? null;
    const { id } = query as unknown as { id: string };

    if (!id) {
      return {
        props: {
          user,
          notfound: true,
        },
      };
    }

    let find_query = `SELECT * FROM Product WHERE id='${id}'`;
    const product = (await client.query(find_query))[0] as Product[];

    return {
      props: {
        user,
        product: product ? JSON.stringify(product[0]) : null,
      },
    };
  } catch (e) {
    return {
      props: {
        error: true,
      },
    };
  }
};

export default Products;
