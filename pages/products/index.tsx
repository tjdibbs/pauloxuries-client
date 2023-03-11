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
import { useAppDispatch, useAppSelector } from "@lib/redux/store";

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
import client from "@lib/client";
import axios from "axios";
import { BASE_URL } from "@lib/constants";

type Props = Partial<{
  product: string;
  notfound: boolean;
  error: boolean;
}>;

const Product: NextPage<Props> = (props) => {
  const { carts } = useAppSelector((state) => state.shop);
  const dispatch = useAppDispatch();
  const router = useRouter();

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

  // if (loading) {
  //   return (
  //     <Container
  //       sx={{
  //         py: 5,
  //         px: 2,
  //         display: "grid",
  //         placeItems: "center",
  //         height: "100%",
  //       }}
  //     >
  //       <Typography mb={2}>Loading...</Typography>
  //       <CircularProgress sx={{ height: 70, width: 70 }} />
  //     </Container>
  //   );
  // }

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

Product.getInitialProps = async (ctx) => {
  let product = null;
  let error = false;
  let product_id = ctx.query.id as string;

  try {
    let getProduct = await axios.get(BASE_URL + "/products/" + product_id);
    product = await getProduct.data;
  } catch (error) {
    console.log({ error });
    error = true;
  }

  return {
    product,
    error,
  };
};

// export const getServerSideProps: GetServerSideProps = async ({
//   req,
//   res,
//   query,
// }) => {
//   try {
//     // @ts-ignore
//     const user = req.session.user ?? null;
//     const { id } = query as unknown as { id: string };

//     if (!id) {
//       return {
//         props: {
//           user,
//           notfound: true,
//         },
//       };
//     }

//     let find_query = `SELECT * FROM Product WHERE id='${id}'`;
//     const product = (await client.query(find_query))[0] as Product[];

//     return {
//       props: {
//         user,
//         product: product ? JSON.stringify(product[0]) : null,
//       },
//     };
//   } catch (e) {
//     console.log({ e });
//     return {
//       props: {
//         error: true,
//       },
//     };
//   }
// };

export default Product;
