import client from "../../lib/connection/db";
import { Router } from "express";
import { STATUS } from "../../lib/constants";
import * as Pauloxuries from "../server.types"
import _ from "lodash";

const wishRouter = Router();

// TODO for admin access, get all the wishes in the database
wishRouter.get("/", () => {
  try {
    let getQuery = `SELECT wishlist FROM Users WHERE id = ""`;
  } catch (e) {}
});

/*
 * push a new wish to user wishlist, provided the user id and the product id
 */
wishRouter.put("/new", async (req, res) => {
  try {
    const { product, user } = req.body;
    if (!product || !user) return res.sendStatus(STATUS.BAD_REQUEST);

    let [{ wishlist }] = (
      await client.query(`SELECT wishlist from users where id = '${user}'`)
    )[0] as { wishlist: string }[];

    let newWishlist = _.union(JSON.parse(wishlist??"[]") as string[], [product]);

    let query = `update Users SET wishlist = '${JSON.stringify(newWishlist)}' where id = '${user}'; UPDATE Product SET likes = likes + 1 WHERE id="${product}"`;
    

    await client.query(query);

    return res.json({ success: true });
  } catch (e) {
    console.log({e})
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
});

// get all product in user wishlist, wishlist is an array of products id which must be provided
// in the request body.
wishRouter.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;
    const { products } = req.body as { products: string[] };

    if (!user || !products) return res.sendStatus(STATUS.BAD_REQUEST);

    // Format the product in sql format, check the IN sql keyword
    let p = products.map((p) => `'${p}'`).join(",");
    let getQuery = `SELECT id,title,price from product where id in(${p})`;

    const wishes = (await client.query(getQuery))[0] as Pauloxuries.User[];

    return res.json({ success: true, wishes });
  } catch (e: any) {
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
});

// This (delete) endpoint removes product from the user wishlist, providing the user id and the index of wish
// in the wishlist array. Required fields is gotten from endpoint params
wishRouter.delete("/:user/:wish", async (req, res) => {
  try {
    let { user, wish } = req.params;
    if (!user || !wish) return res.sendStatus(STATUS.BAD_REQUEST);

    let [{ wishlist }] = (
      await client.query(`SELECT wishlist from users where id = '${user}'`)
    )[0] as { wishlist: string }[];


    let newWishlist = (JSON.parse(wishlist ?? "[]") as string[]).filter(
      (_w) => _w !== wish 
    );

    console.log({wishlist, newWishlist})

    let removeQuery = `update users SET wishlist="${JSON.stringify(newWishlist)}" where id = '${user}';update Product SET likes = likes - 1 where id = "${wish}"`;

    await client.query(removeQuery);
    return res.sendStatus(STATUS.OK);
  } catch (e: any) {
    console.log({e})
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
});
export default wishRouter;
