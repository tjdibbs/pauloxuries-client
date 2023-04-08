import { Router } from "express";

import client from "../../lib/connection/db";
import isAdmin from "../../lib/security/adminAccess";
import { nanoid } from "nanoid";
import _ from "lodash";
import * as Pauloxuries from "../server.types"


import CartProduct = Pauloxuries.CartProduct;
import { STATUS } from "../../lib/constants";

const cartRouter = Router();

// get all carts in the database
// this can only be access by the admin
cartRouter.get<{ skip: string }>("/admin", isAdmin, async (req, res) => {
  try {
    const { skip = 0 } = req.params;

    let query = `SELECT * from carts LIMIT 20 OFFSET ${skip}`;
    const allCarts = (await client.query(query))[0] as Pauloxuries.Cart[];

    return res.json(allCarts);
  } catch (e) {
    console.error({ e });
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Error getting carts from database" });
  }
});

// Insert new cart into the data, all fields required most be included in the body
// if not an error will be return without giving the exact error
// requiredFields (id: string, product_id: string, user: string, quantity: number)
cartRouter.put<{}, {}, { carts: Pauloxuries.CartProduct[]; user: string }>(
  "/new",
  async (req, res) => {
    try {
      let { carts, user } = req.body;

      if (!carts || !user) return res.sendStatus(400);

      let formattedCarts = carts.map((cart) => ({
        ...cart,
        product: JSON.stringify(cart.product),
        colors: JSON.stringify(cart.colors ?? []),
        sizes: JSON.stringify(cart.sizes ?? [])
      }));

      let keys = Object.keys(formattedCarts[0]);

      const cartValues = formattedCarts.map((cart) => Object.values(cart));
      const ids = carts.map((f) => f.product.id + user);

      let [{ cart }] = (
        await client.query(`SELECT cart from users where id = '${user}'`)
      )[0] as { cart: string }[];
      
      let newCart = _.union(JSON.parse(cart??"[]") as string[], ids);
      let insertQuery = `UPDATE users SET cart = '${JSON.stringify(
        newCart
      )}' WHERE id = '${user}';INSERT IGNORE into carts(${keys}) VALUES ?;
                         `;

      await client.query(insertQuery, [cartValues]);

      res.sendStatus(201);
    } catch (e: any) {
      console.log({ e });
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Error inserting cart into database" });
    }
  }
);

// Get carts that belongs to a particular user using the user id supplied in params
cartRouter.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;

    if (!user) return res.sendStatus(STATUS.BAD_REQUEST);

    const findQuery = `SELECT * FROM carts WHERE user = '${user}'`;
    let carts = (await client.query(findQuery))[0] as Pauloxuries.Cart[];

    let dbProductIds = carts.map((cart) =>{
      if(typeof cart.product == "string"){
        return (JSON.parse(cart.product as string) as Pauloxuries.Product).id
      }

      return cart.product.id
    });

    if (!dbProductIds?.length) return res.json({ success: true, carts: [] });

    let getQuery = `SELECT id, title, price, discountPercentage, stock,sold,
       JSON_EXTRACT(images, "$[1]") as image FROM Product WHERE id IN(${dbProductIds
         .map((id) => `'${id}'`)
         .join(",")})`;

    let products = (await client.query(getQuery))[0] as Pauloxuries.Product[];
    let compiledCarts = carts.map((cart) => {
      let product = products.find((product) => product.id+user == cart.id) ?? cart.product;
      return _.omit({
        ...cart,
        product,
      }, "user");
    });

    return res.json({ success: true, carts: compiledCarts });
  } catch (e: any) {
    console.log({ e });
    return res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Error getting total cart" });
  }
});

// update user cart, user id and product id being provided
cartRouter.patch<{ user: string; cart: string }, {}, Partial<Pauloxuries.Cart>>(
  "/:user/:cart",
  async (req, res) => {
    try {
      const { user, cart } = req.params;
      const fields = req.body ?? {};

      if (!user || !cart) return res.sendStatus(STATUS.BAD_REQUEST);

      let updateQuery = `UPDATE carts SET ? WHERE user='${user}' AND product_id='${cart}' `;
      await client.query(updateQuery, [fields]);

      return res.sendStatus(STATUS.OK);
    } catch (e: any) {
      console.log({ e });
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Error patching updating fields" });
    }
  }
);

// delete a particular cart that belongs to a user using the user id and the product
// as means of identification for the cart
cartRouter.delete("/:user/:cartId", async (req, res) => {
  try {
    const { user, cartId } = req.params;

    let [{ cart }] = (
      await client.query(`SELECT cart from users where id = '${user}'`)
    )[0] as { cart: string }[];


    let newCart = (JSON.parse(cart) as string[]).filter(
      (cart) => cart !== cartId+user
    );

    let deleteQuery = `DELETE FROM carts WHERE id='${
      cartId+user
    }'; update users SET cart='${JSON.stringify(newCart)}' where id = '${user}'`;
    await client.query(deleteQuery);

    return res.sendStatus(STATUS.OK);
  } catch (e) {
    console.log({ e });
    return res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error deleting cart" });
  }
});

export default cartRouter;
