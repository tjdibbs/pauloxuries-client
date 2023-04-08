import { Router } from "express";

import bcryptjs from "bcryptjs";
import upload from "./upload";
import productsRouter from "./product";

import cartRouter from "./cart";
import _ from "lodash";
import client from "../../lib/connection/db";
import { nanoid } from "nanoid";

import Emailer, { Email } from "../emailer";
import JWT from "jsonwebtoken";
import wishRouter from "./wish";
import authRouter from "./auth";
import reviewRouter from "./review";
import orderRouter from "./order";

const router = Router();

// extend router
router.use("/upload", upload);
router.use("/products", productsRouter);
router.use("/carts", cartRouter);
router.use("/wish", wishRouter);
router.use("/auth", authRouter);
router.use("/reviews", reviewRouter);
router.use("/order", orderRouter);

const getUser = async (id: string) => {
  try {
    const query = `SELECT id,firstname,image,lastname,email,carts,wishlist,admin,verified FROM Users WHERE id='${id}'`;

    let user = (await client.query(query)) as {}[][];
    return user[0][0];
  } catch (e) {
    return null;
  }
};

// router.get("/many", InsertMany);

router.put("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) new Error("Not allowed");

    let query = "INSERT INTO Subscribers SET ?";

    await client.query(query, { email });

    // Sending mail to the email address synchronously
    Emailer(email, Email.SUBSCRIBE);

    return res.json({ success: true, message: "Thanks for subscribing" });
  } catch (e: any) {
    return res.json({ success: false, message: "Email already exist" });
  }
});

router.put("/visitor", async (req, res) => {
  try {
    //   const data = {
    //     ip: clientInfo.ip,
    //     continent: clientInfo.continent.en,
    //     country: clientInfo.country,
    //     latitude: clientInfo.latitude,
    //     longitude: clientInfo.longitude,
    //   };
    //   const query = "INSERT INTO Visitors SET ?";

    //   await client.query(query, data);

    return res.json({ success: true });
    // });
  } catch (e: any) {
    return res.json({ success: true, message: e.message });
  }
});

export default router;
