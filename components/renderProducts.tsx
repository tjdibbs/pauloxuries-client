import { useCustomEventListener } from "react-custom-events";
import { Product } from "@lib/types";
import React from "react";
import { Box, Grid, Pagination } from "@mui/material";
import ProductStyle2 from "./productStyle2";
import { motion } from "framer-motion";
import { sort } from "./filter";
import sortByPrice from "@helper/sortByPrice";

const RenderProducts = (props: { products: Product[] }) => {
  const [filterProducts, setFilterProducts] = React.useState<Product[]>(
    props.products ?? []
  );
  const [page, setPage] = React.useState(1);
  const [sortValue, setSortValue] = React.useState<keyof typeof sort>("FE");
  const productsContainerRef = React.useRef<HTMLDivElement>(null);

  useCustomEventListener("FilteredProductsEvent", (products: Product[]) => {
    setFilterProducts(products);
    setPage(1);
  });

  useCustomEventListener("SortEvent", (type: keyof typeof sort) => {
    setSortValue(() => type);
  });

  React.useEffect(() => {
    switch (sortValue) {
      case "Z-A":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort((a, b) => b.title.localeCompare(a.title)),
        ]);
        break;
      case "A-Z":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort((a, b) => a.title.localeCompare(b.title)),
        ]);
        break;
      case "P-L-H":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort((a, b) => sortByPrice(a, b, "P-L-H")),
        ]);
        break;
      case "P-H-L":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort((a, b) => sortByPrice(a, b, "P-H-L")),
        ]);
        break;
      case "D-N-O":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort(
            // @ts-ignore
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ),
        ]);
        break;
      case "D-O-N":
        setFilterProducts((filterProducts) => [
          ...filterProducts.sort(
            // @ts-ignore
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          ),
        ]);
        break;
      default:
        setFilterProducts(props.products);
        break;
    }
  }, [props.products, sortValue]);

  if (!props.products) return <></>;

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    productsContainerRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
    setPage(value);
  };

  const count =
    filterProducts.length % 12 === 0
      ? filterProducts.length / 12
      : Math.floor(filterProducts.length / 12) + 1;

  return (
    <React.Fragment>
      <div className="products flex-grow my-5" ref={productsContainerRef}>
        <Grid container spacing={1}>
          {filterProducts
            .slice((page - 1) * 12, 12 * page)
            .map((brand, index) => (
              <ProductStyle2 key={index} item={brand} />
            ))}
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
      <Box className="pagination-wrapper w-max m-auto my-5 rounded-lg p-4">
        <Pagination
          count={count}
          page={page}
          size={"small"}
          variant={"outlined"}
          onChange={handleChange}
        />
      </Box>
    </React.Fragment>
  );
};

export default RenderProducts;
