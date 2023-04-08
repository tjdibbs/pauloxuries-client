import axios from "axios";
import { nanoid } from "nanoid";
import type { Response, Request } from "express";

import client from "../../lib/connection/db";
import { products } from "./data";

export default async function InsertMany(req: Request, res: Response) {
  try {
    let _products = products.map((product) => {
      // @ts-ignore
      delete product["createdAt"];
      // @ts-ignore
      delete product.updatedAt;
      // @ts-ignore
      delete product.reviews;
      // @ts-ignore
      delete product.rating;
      // @ts-ignore
      delete product.thumbnail;

      return {
        ...product,
        images: JSON.stringify(product.images),
        sizes: JSON.stringify(product.sizes),
        colors: JSON.stringify(product.colors),
      };
    });

    const keys = Object.keys(products[0]).join(",");

    let query = `INSERT INTO Product(${keys}) VALUES ?`;
    const insert = await client.query(query, [
      _products.map((p) => Object.values(p)),
    ]);

    return res.json({
      success: true,
      insert,
      query,
    });
  } catch (error) {
    console.log({ error });
    return res.json({ error });
  }
}
