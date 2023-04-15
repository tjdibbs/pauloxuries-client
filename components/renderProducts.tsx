import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import { Product, RouterQuery } from "@lib/types";
import React from "react";
import { Box, Grid, Pagination } from "@mui/material";
import ProductStyle2 from "./productStyle2";
import { motion } from "framer-motion";
import { sort } from "./filter";
import { useAppSelector } from "@lib/redux/store";
import Loading from "@comp/loading";
import SortFunc from "@helper/sort";
import { Events } from "@lib/constants";
import { useRouter } from "next/router";
import checkProduct from "@helper/checkProduct";
import axios from "axios";
import useMessage from "@hook/useMessage";

const RenderProducts = (props: { products: Product[] }) => {
  const router = useRouter();
  const { shop_by, name } = router.query;

  const { cart, wishlist } = useAppSelector((state) => state.shop);

  // set to true if we are fetching more products from the database
  const [fetching, setFetching] = React.useState<boolean>(false);

  // this is used to tell if some product are still yet to be fetched in database
  const [productsFinished, setProductFinished] = React.useState<boolean>(false);

  const [products, setProducts] = React.useState<Product[]>(props.products);
  const [filterProducts, setFilterProducts] = React.useState<Product[]>(
    props.products ?? []
  );

  // const [page, setPage] = React.useState(1);
  const [sortValue, setSortValue] = React.useState<keyof typeof sort>("FE");
  const productsContainerRef = React.useRef<HTMLDivElement>(null);

  const { alertMessage } = useMessage();

  useCustomEventListener(Events.SORT, setSortValue, []);
  useCustomEventListener(Events.NEW_PRODUCTS, setFilterProducts, []);

  React.useEffect(() => {
    setFilterProducts(SortFunc.bind({ sortValue }));
  }, [sortValue]);

  const fetchMoreProduct = React.useCallback(async () => {
    try {
      setFetching(true);

      let endpoint =
        "/api/products" +
        (shop_by && name ? `/${shop_by}/${name}` : "") +
        `?skip=${products.length}`;

      const getProducts = await axios.get(endpoint);
      const { success, products: P } = await getProducts.data;

      if (success && P?.length) {
        // we need to sort the fetched products based on the selected sort value
        setProducts((products) => {
          setFilterProducts((products) =>
            products.concat(SortFunc.call({ sortValue }, P))
          );
          return products.concat(P);
        });

        emitCustomEvent(Events.FETCHED, products.concat(P));
      } else setProductFinished(true);
    } catch (error) {
      console.error(error);
      alertMessage(
        "We are having issue communicating with the server",
        "error"
      );
    }

    setFetching(false);
  }, [alertMessage, name, products, shop_by, sortValue]);

  React.useEffect(() => {
    document.body.onscroll = (e) => {
      let footerHeight = document.querySelector("footer")!.clientHeight;
      let bodyHeight = document.documentElement.scrollHeight;
      let scrollTop = window.scrollY + footerHeight + 125.5;

      // console.log({ bodyHeight, scrollTop, footerHeight });
      if (bodyHeight - scrollTop < 900 && !fetching && !productsFinished)
        fetchMoreProduct();
    };

    return () => {
      document.body.onscroll = null;
    };
  }, [fetchMoreProduct, fetching, productsFinished]);

  React.useEffect(() => {
    const query = router.query as unknown as RouterQuery;

    // filter product based on the query in the url
    let filteredProducts = props.products.filter((product) =>
      checkProduct(query, product)
    );

    setFilterProducts(filteredProducts);
  }, [props.products, router]);

  // const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
  //   productsContainerRef.current?.scrollIntoView({
  //     behavior: "auto",
  //     block: "start",
  //   });
  //   setPage(value);
  // };

  // const count =
  //   filterProducts.length % 12 === 0
  //     ? filterProducts.length / 12
  //     : Math.floor(filterProducts.length / 12) + 1;

  if (!filterProducts?.length) return <></>;

  return (
    <React.Fragment>
      <div className="products flex-grow my-5" ref={productsContainerRef}>
        <Grid container spacing={1}>
          {filterProducts.map((product, index) => {
            const inCart = cart.findIndex(
              (cart) => cart.product!.id === product.id
            );
            const inWishlist = wishlist.includes(product.id);
            return (
              <ProductStyle2
                key={index}
                item={product}
                {...{ inCart, inWishlist }}
              />
            );
          })}
          {fetching && <ProductsLoader />}
        </Grid>
        {!Boolean(filterProducts.length) && (
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="card mt-10"
          >
            <div className="text font-bold text-center">
              No product matched the selected filter option
            </div>
          </motion.div>
        )}
      </div>
      {/* <Box className="pagination-wrapper w-max m-auto my-5 rounded-lg p-4">
        <Pagination
          count={count}
          page={page}
          size={"small"}
          variant={"outlined"}
          onChange={handleChange}
        />
      </Box> */}
    </React.Fragment>
  );
};

export const ProductsLoader = () => (
  <React.Fragment>
    {Array.from(new Array(4)).map((_, index) => (
      <Loading key={index} />
    ))}
  </React.Fragment>
);

export default RenderProducts;
