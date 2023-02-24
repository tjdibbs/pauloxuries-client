import "../styles/custom.sass";
import type { AppProps } from "next/app";
import React from "react";
import Layout from "@comp/layout";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { Provider } from "react-redux";
import store from "@lib/redux/store";
import { SnackbarProvider } from "notistack";
import NextNProgress from "nextjs-progressbar";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/effect-coverflow";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "react-alice-carousel/lib/alice-carousel.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import "../styles/adjust.css";
import "../styles/error.css";
import "../styles/global.css";
import { ConfigProvider } from "antd";
import PageLoading from "@comp/PageLoading";
import { Router } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SnackbarProvider maxSnack={3}>
        <Layout>
          {/* <NextNProgress
            color="#997a00"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
          /> */}
          <PageLoading />
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#997a00",
                colorPrimaryBgHover: "#997a0060",
                colorPrimaryBg: "#997a00",
              },
            }}
          >
            <Component {...pageProps} />
          </ConfigProvider>
        </Layout>
      </SnackbarProvider>
    </Provider>
  );
}

export default MyApp;
