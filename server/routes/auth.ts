import client from "../../lib/connection/db";
import { Router } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";
import JWT from "jsonwebtoken";
import Emailer, { Email } from "../emailer";
import { nanoid } from "nanoid";
import { SECRET_KEY, domain, STATUS } from "../../lib/constants";
import parseCookie from "../../utils/parseCookie";
import * as Pauloxuries from "../server.types"

const authRouter = Router();

authRouter.post("/sign-in", async (req, res) => {
  try {
    // console.log({
    //   header: req.headers["cookie"],
    //   signedCookies: req.signedCookies,
    //   cookies: req.cookies,
    // });

    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ success: false, message: "not allowed" });

    const query = `SELECT id, password, firstname, lastname, verified, admin, email, cart
                   FROM Users WHERE email='${email}'`;

    let user = (await client.query(query))[0] as Pauloxuries.User[];
    let compareMatch = await bcryptjs.compare(
      password,
      user[0]?.password ?? ""
    );

    if (!compareMatch || !user) {
      return res.json({
        success: false,
        message: "Incorrect Username Or Password",
      });
    }

    let cart = JSON.parse(req.cookies?.cart ?? "[]") as Pauloxuries.Cart[];
    let wishlist = req.cookies?.wishlist;

    let setQuery: string = ``;
    let queryParameters = [];

    if (cart?.length) {
      let formattedCarts = cart.map(
        (cartProduct) => ({
          ...cartProduct,
          id: nanoid(),
          user: user[0].id,
          product: JSON.stringify(cartProduct.product),
        })
      );

      let keys = Object.keys(formattedCarts[0]);

      const cartValues = formattedCarts.map((cart) => Object.values(cart));

      setQuery += `INSERT into carts(${keys}) VALUES ?;`;
      queryParameters.push(cartValues);
    }

    if (wishlist) {
      setQuery += `UPDATE users SET wishlist = JSON_MERGE_PATCH(carts, '${wishlist}') WHERE id = '${user[0].id}'`;
    }

    // console.log({ cart, wishlist, setQuery, queryParameters });

    let session = _.omit(user[0], ["password"]);
    let token = JWT.sign(session, SECRET_KEY);

    res.cookie("access_token", token);

    //  @ts-ignore
    req.session.user = { id: session.id };
    req.session.save();

    // if (!user[0].verified) {
    //   // let token = JWT.sign(session, SECRET_KEY, {
    //   //   expiresIn: "2h",
    //   // });

    //   // Emailer(user[0].email, Email.REGISTER, {
    //   //   firstname: user[0].firstname,
    //   //   verify_url: `${domain}/email/verified?token=${token}&email=${user[0].email}`,
    //   // });
    // }

    return res.json({
      success: true,
      user: session,
    });
  } catch (e: any) {
    console.log({ e });
    return res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
  }
});

authRouter.post("/sign-up", async (req, res) => {
  try {
    let { firstname, lastname, email, password, phone } = req.body;
    if (!firstname || !lastname || !email || !password)
      return res.sendStatus(STATUS.BAD_REQUEST);

    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(password, salt);

    const newUserQuery = `INSERT INTO Users SET ?`;
    const user = {
      ...req.body,
      id: nanoid(),
      password: hash,
    };

    await client.query(newUserQuery, user);
    let token = JWT.sign(_.omit(user, "password"), SECRET_KEY, {
      expiresIn: "2h",
    });

    Emailer(email, Email.REGISTER, {
      firstname,
      verify_url: `${domain}/email/verified?token=` + token,
    });

    return res.json({ success: true });
  } catch (e: any) {
    let message = e.message.includes("Duplicate entry")
      ? "Email already exist"
      : "Internal Server Error";
    return res.status(400).json({ success: false, message });
  }
});

authRouter.get("/getUser", async (req, res) => {
  try {
    // @ts-ignore
    let { user: sessionUser } = req.session;

    if (!sessionUser) return res.json({ user: null });
    const getUserQuery = `SELECT id, firstname, wishlist, lastname, email, verified, admin, cart From Users WHERE id = '${sessionUser.id}'`;

    const userInfo = (
      await client.query(getUserQuery)
    )[0] as Pauloxuries.User[];
    
    res.json({ user: userInfo[0] });
  } catch (error: any) {
    console.log({ error });
    return res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
});

authRouter.post("/send-email", async (req, res) => {
  try {
    const { email, firstname, type } = req.body;
    const user = {
      email,
      firstname,
    };

    let token = JWT.sign(
      user,
      SECRET_KEY,
      type != "changed-password" ? { expiresIn: "2h" } : {}
    );

    await Emailer(email, type, {
      firstname,
      verify_url: `${domain}/email/verified?token=` + token,
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.json({ success: false, error: error.message });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) new Error("Forbidden: Some fields are missing");

    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(password, salt);

    const updateQuery = `UPDATE Users SET password='${hash}' WHERE email='${email}'`;

    await client.query(updateQuery);
    return res.json({ success: true });
  } catch (error: any) {
    console.log({ error });
    return res.json({ success: false, error: error.message });
  }
});

authRouter.post("/request-password-change", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) new Error("Forbidden: Some fields are missing");
    const checkQuery = `SELECT firstname FROM Users WHERE email='${email}'`;

    // @ts-ignore
    const user = (await client.query(checkQuery))[0][0] as User;

    if (!user)
      return res.json({
        success: false,
        message: "The email you entered has no account with us",
      });

    let data = {
      email,
      firstname: user.firstname,
    };

    let token = JWT.sign(data, SECRET_KEY, {
      expiresIn: "2h",
    });

    await Emailer(email, Email.CHANGE, {
      firstname: user.firstname,
      verify_url: `${domain}/reset-password?token=` + token,
    });

    return res.json({
      success: true,
      message:
        "We have sent a link to your email. Please you the link to reset your password. Expires in 2hours",
    });
  } catch (error) {
    console.error({ error });
    return res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
  }
});

export default authRouter;
