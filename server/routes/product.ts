import { Router } from "express";
import _ from "lodash";

import client from "../../lib/connection/db";
import { STATUS } from "../../lib/constants";
import InsertMany from "./insertProducts";
import * as Pauloxuries from "../server.types"

const productsRouter = Router();
const SelectFields = `id, title, price, discountPercentage, JSON_EXTRACT(images, "$[0]") as image, stock, sold, sizes, colors, category, createdAt`;

/**
 * {string} @limit - default = 12
 * {number | string} @skip default = null
 * @description - Api called to get product based on limits and skip specified
 */

productsRouter.get<{}, {}, {}, { limit: number; skip: number }>(
  "/",
  async (req, res) => {
    try {
      const { skip = 0 } = req.query;
      let query = `SELECT ${SelectFields} FROM Product LIMIT 50 OFFSET ${skip}`;

      let products = (await client.query(query))[0] as Pauloxuries.Product[];
      return res.json({ success: true, products });
    } catch (e) {
      console.log({ e });
      return res.json({ error: "Internal Server Error" });
    }
  }
);

// get product by product id
productsRouter.get("/_/:product", async (req, res) => {
  try {
    const product_id = req.params.product;
    console.log({ product_id });
    let query = `SELECT * FROM Product WHERE id = '${product_id}'`;

    let [product] = (await client.query(query))[0] as Pauloxuries.Product[];
    return res.json({ success: true, product });
  } catch (e) {
    console.log({ e });
    return res.json({ error: "Internal Server Error" });
  }
});

// update product by product id
productsRouter.patch("/_/:product", async (req, res) => {
  try {
    let product = req.params;
    let fields = req.body;

    if (!product || !fields) return res.sendStatus(STATUS.BAD_REQUEST);

    let updateQuery = `update products set ? WHERE id = ${product}`;
    await client.query(updateQuery, [fields]);

    res.sendStatus(STATUS.OK);
  } catch (error: any) {
    console.error({ error });
    res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * {string} @search - the search text
 * {number | string} @skip default = null
 * @description - Api called to search for products based on search string
 *  and skip in the query
 */
productsRouter.get<{}, {}, {}, { s: string; skip: number }>(
  "/search",
  async (req, res) => {
    try {
      const { skip = 0, s } = req.query;

      if (!s) return res.sendStatus(STATUS.BAD_REQUEST);

      // let keywords: string[] = search.toLocaleLowerCase().trim().split(/\W/);
      let search = s.split(" ").join("|");
      let searchQuery = `SELECT ${SelectFields} FROM Product WHERE title REGEXP '${search}' OR brand REGEXP '${search}' OR category REGEXP '${search}' LIMIT 20 OFFSET ${skip}`;
      const products = (await client.query(searchQuery))[0];

      return res.json({ success: true, products });
    } catch (e: any) {
      console.log({ e });
      return res.status(500).json({
        error: e.message,
      });
    }
  }
);

/**
 * {string} @brand - Brand name needs to be specified
 * {title} @title - search keywords are extracted the title of the product
 * @description - Api called to get the related products
 * when user is view a particular in the product index page
 *
 */
productsRouter.get<{}, {}, {}, { category: string; skip: number }>(
  "/related",
  async (req, res) => {
    try {
      const { skip = 0, category } = req.query;
      let searchQuery = `SELECT ${SelectFields} FROM Product WHERE category REGEXP '${category
        .split(",")
        .join("|")}' LIMIT 12 OFFSET ${skip}`;

      const products = (await client.query(searchQuery))[0];
      return res.json({ success: true, products });
    } catch (e: any) {
      return res.json({ success: false, products: [], error: e.message });
    }
  }
);

/**
 * {any} @key - The targeted field should be specified here
 * {any} @value - The value to search against the @field should be specified here.
 * @description - Api called to get products based on the key and the value provided.
 * It's helpful if you don't know the field of the product to target
 */
productsRouter.get("/:key/:value", async (req, res) => {
  try {
    const { key, value } = req.params;
    const { skip = 0 } = req.query;

    if (!key || !value) return res.sendStatus(402);

    const findQuery = `SELECT ${SelectFields} FROM Product WHERE ${key} LIKE '%${value}%' LIMIT 20 OFFSET ${skip}`;
    const products = (await client.query(findQuery))[0];

    return res.json({ success: true, products });
  } catch (e) {
    console.log({ e });
    return res.status(500).json({ error: "Error fetching products by filter" });
  }
});

productsRouter.get("/new", async (req, res) => {
  try {
    const getNewProductsQuery = `SELECT ${SelectFields} FROM Product ORDER BY createdAt ASC LIMIT 8`;
    const products = (await client.query(getNewProductsQuery))[0];

    return res.json({ success: true, products });
  } catch (e) {
    return res.json({ success: false, products: [] });
  }
});

productsRouter.get("/sport", async (req, res) => {
  try {
    const getNewProductsQuery = `SELECT ${SelectFields} FROM Product WHERE category Like "%sport%" OR title LIKE '%sport%' LIMIT 8`;
    const products = (await client.query(getNewProductsQuery))[0];

    return res.json({ success: true, products });
  } catch (e) {
    return res.json({ success: false, products: [] });
  }
});

/**
 * It takes no params or body or query
 * @description - Api called to get products that are recently uploaded
 * from the top to index of 12
 */
productsRouter.get("/top", async (req, res) => {
  try {
    const getNewProductsQuery = `SELECT ${SelectFields} FROM Product WHERE price >= 10000 AND category NOT REGEXP 'jersey' ORDER BY sold ASC LIMIT 8`;

    const products = (await client.query(getNewProductsQuery))[0];
    return res.json({ success: true, products });
  } catch (e) {
    return res.json({ success: false, products: [] });
  }
});

// used to insert multiple products
productsRouter.put("/many", InsertMany);

// get products with their ids provided in an array form
productsRouter.post<{}, {}, string[]>("/info", async (req, res) => {
  try {
    let product_ids = req.body;
    let getQuery = `SELECT ${SelectFields} FROM Product WHERE id IN(${product_ids
      .map((id) => `'${id}'`)
      .join(",")})`;

    let products = (await client.query(getQuery))[0];
    return res.json({ products, success: true });
  } catch (e) {
    console.log({ e });
    return res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
  }
});

// function FilterWords(title: string) {
//   return title
//     .toLocaleLowerCase()
//     .trim()
//     .split(/\W/)
//     .filter((word) => {
//       const wordsToRemove = ["with", "many", "said"];
//       let hasNumber = /\d|\W/.test(word);
//
//       return word.trim().length > 3 &&
//           !wordsToRemove.includes(word.trim()) &&
//           !hasNumber;
//
//
//     })
//     .join("|");
// }

export default productsRouter;
