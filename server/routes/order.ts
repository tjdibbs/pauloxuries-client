import { Router } from "express";

import client from "../../lib/connection/db";
import _ from "lodash";
import { nanoid } from "nanoid";
import Emailer, { Email } from "../emailer";
import { SECRET_KEY, STATUS } from "../../lib/constants";
import * as Pauloxuries from "../server.types";

import JWT from "jsonwebtoken";

const orderRouter = Router();

orderRouter.post<{}, {}, Pauloxuries.Order>("/checkout", async (req, res) => {
  try {
    const body = req.body;
    if (!body.user?.id && !body.email && !body.name && !body.paymentMethod)
      return res.sendStatus(STATUS.BAD_REQUEST);

    const information = {
      id: nanoid(),
      email: body.email ?? body.user?.email,
      country_region: body.country,
      city: body.city,
      state: body.state,
      phone: body.phone,
      address: body.address,
      paymentMethod: body.paymentMethod,
    };

    const SessionUser = body.user;
    // const productsID = body.cart.reduce<string[]>((ids, cartProduct) => {
    //   ids.push(`'${cartProduct.product.id}'`);
    //   return ids;
    // }, []);

    // let updateProducts = body.cart
    //   .map(
    //     ({ product, quantity }) =>
    //       `UPDATE Product SET stock = stock - ${quantity} WHERE id = '${product.id}'`
    //   )
    //   .join(";");

    // await client.query(updateProducts);
    let parameter = [];

    let productSoldUpdateQuery: string = body.cart
      .map(({ product, quantity }) => {
        return `UPDATE Product SET sold = sold + ${quantity}, stock = stock - ${quantity}  WHERE id = '${product.id}'`;
      })
      .join(";");

    if (body.create) {
      let user = {
        id: nanoid(),
        firstname: body.name.split(" ")[0],
        lastname: body.name.split(" ")[1] ?? "",
        email: body.email,
        phone: body.phone,
        password: "",
        getUpdates: Boolean(body.update),
      };

      let newUserQuery = `;INSERT Into Users SET ? ON DUPLICATE KEY UPDATE phone = '${user.phone}'`;

      productSoldUpdateQuery += newUserQuery;
      parameter.push(user);
    }

    if (body.subscribe) {
      let subscribeQuery = `;INSERT IGNORE Into subscribers(email) VALUES('${body.email}')`;
      productSoldUpdateQuery += subscribeQuery;
    }

    if (body.update) {
      let updateQuery = `;INSERT IGNORE Into updates(email) VALUES('${body.email}')`;
      productSoldUpdateQuery += updateQuery;
    }

    // data to store in database
    const order = {
      id: nanoid(),
      userid: body.email,
      ..._.omit(body, [
        "agree",
        "create",
        "subscribe",
        "update",
        "user",
        "save",
      ]),
      cart: JSON.stringify(body.cart),
    };

    parameter.push(order);

    // can only remove cart from database if the user that made the order is a registered user
    // carts saved to database if user is registered and signed in on the browser
    if (body.user) {
      let cartIds = body.cart.map((c) => `"${c.id}"`).join(",");
      productSoldUpdateQuery += `;DELETE FROM carts WHERE id IN(${cartIds})`;
    }

    let newOrderQuery = `;INSERT INTO Orders SET ?;`;

    // multi execute database query
    await client.query(productSoldUpdateQuery + newOrderQuery, parameter);

    // Sending Alert Email to pauloxuries Order Email Address (order@pauloxuries.com) and
    // Sending Order details to the user email that ordered the products

    // This is the information that will be required in the order email template
    let OrderAlertData = {
      ...information,
      ...body,
      carts: body.cart,
      userid: SessionUser?.id ?? body.email,
    };

    await Emailer("order@pauloxuries.com", Email.ORDER, OrderAlertData);
    await Emailer(SessionUser?.email ?? body.email, Email.CHECKOUT, {
      ...information,
      ...body,
      carts: body.cart,
    });

    let responseData: {
      success: boolean;
      orderId: string;
      token?: string;
    } = { success: true, orderId: order.id };

    if (body.create) {
      // Then user need to create a password
      // Create a short token to help create password within a period

      let token = JWT.sign({ email: body.email }, SECRET_KEY, {
        expiresIn: "2h",
      });
      responseData.token = token;
    }

    // Return a response back to the user
    return res.json(responseData);
  } catch (e: any) {
    console.log({ e });
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: e.message || "Internal server error",
    });
  }
});

orderRouter.post("/user/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) new Error("Not allowed");

    let query = `SELECT * from Orders WHERE userid = ?`;

    const orders = (await client.query(query, [userid]))[0];

    return res.json({ success: true, orders });
  } catch (e: any) {
    return res.json({
      success: false,
      message: e.message || "Internal server error",
    });
  }
});

orderRouter.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.sendStatus(STATUS.BAD_REQUEST);

    let query = `SELECT * from Orders WHERE id = ?`;
    const orders = (await client.query(query, [orderId]))[0];

    return res.json({ success: true, orders });
  } catch (e: any) {
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      message: e.message || "Internal server error",
    });
  }
});

orderRouter.delete("/cancel", async (req, res) => {
  try {
    const { order_id, all, user, products } = req.body;

    if (!order_id || !user) return res.sendStatus(STATUS.BAD_REQUEST);

    let order = (
      await client.query("SELECT * from Order WHERE id = ?", [order_id])
    )[0] as Pauloxuries.Order[];

    let parseOrder: Pauloxuries.Order = {
      ...order[0],
      cart: JSON.parse(order[0].cart as unknown as string),
    };

    if (all) {
      await client.query(
        "UPDATE orders SET status = 'cancelled' WHERE id = ?",
        [order_id]
      );
    } else if (products?.length) {
      let updatedOrder = {
        ...parseOrder,
        cart: parseOrder.cart.map((cartProduct) => {
          return {
            ...cartProduct,
            status: products.include(cartProduct.product.id)
              ? "cancelled"
              : cartProduct.status,
          };
        }),
      };
      await client.query(`UPDATE orders SET cart = ? WHERE id = ?`, [
        JSON.stringify(updatedOrder),
        order_id,
      ]);
    }

    let CancelAlertData = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      products,
      order_id,
    };

    Emailer("cancel@pauloxuries.com", Email.CANCEL, CancelAlertData);

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message ?? "Internal Server Error",
    });
  }
});

export default orderRouter;
