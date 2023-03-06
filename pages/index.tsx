/* eslint-disable react/no-unescaped-entities */
import { Box, Typography, useTheme, Container, Divider } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import React from "react";
import { AppState, Product } from "@lib/types";
// import client from "@server/connection/db";

// components
import BrandShopping from "@comp/LandingPage/brandShopping";
import TopProducts from "@comp/LandingPage/topProducts";
import Category from "@comp/LandingPage/category";
import LandingPageSwiper from "@comp/LandingPage/landingSwiper";
import Arrivals from "@comp/LandingPage/arrivals";
import FetchCartsHook from "@comp/fetchCartsHook";
import Collections from "@comp/LandingPage/collections";
import SEO from "@comp/seo";
import Viewed from "@comp/viewed";
import dynamic from "next/dynamic";

const pageDescription = {
  title: `Home`,
  description:
    "Get quality wears from different brands, we provide fashion combination for you, you don't have to worry about what to wear. Get yours sneakers, oversized, trousers, rugged jeans and others, for both men and women. ",
  url: "https://pauloxuries.com/",
  image: "https://pauloxuries.com/identity/dark-logo.png",
};

const Home: React.FC<{ user: AppState["user"]; jerseys: string }> = ({
  user,
  jerseys,
}) => {
  // FetchCartsHook({ user, loading: false, setLoading: () => null });


  return (
    <React.Fragment>
      <SEO {...pageDescription} />
      <Box className="landingPage-content">
        <Box className="window-screen">
          <LandingPageSwiper />
        </Box>
        <Box className="arrivals" mt={3}>
          <Box className="section-wrapper">
            <Arrivals />
          </Box>
        </Box>
        <Box className="shop-by-brand" mt={5}>
          <Box className="section-header" mb={4}>
            <Divider>
              <Typography variant="h6" fontWeight={800}>
                Shop By Brand
              </Typography>
            </Divider>
          </Box>
          <BrandShopping />
        </Box>
        <Box className="top-products" mt={5}>
          <Box className="section-header" mb={4}>
            <Divider>
              <Typography variant="h6" fontWeight={800}>
                Top Products
              </Typography>
            </Divider>
          </Box>
          <Box className="section-wrapper">
            <TopProducts />
          </Box>
        </Box>
        <Box className="collections">
          <Box mb={4}>
            <Divider>
              <Typography variant="h6" fontWeight={800}>
                Shop By Category
              </Typography>
            </Divider>
          </Box>

          <Collections />
        </Box>
        <Box className="category" mt={5}>
          {/*<Category jerseys={jerseys} />*/}
        </Box>
      </Box>
      <Viewed />
    </React.Fragment>
  );
};

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const { req } = ctx;
//   // @ts-ignore
//   const user = req.session?.user ?? null;
//   // const jerseys = (
//   //   await client.query(
//   //     "SELECT * FROM Product WHERE category REGEXP 'jersey' LIMIT 12"
//   //   )
//   // )[0];
//
//   return {
//     props: {
//       user,
//       // jerseys: JSON.stringify(jerseys),
//     },
//   };
// };

export default Home
