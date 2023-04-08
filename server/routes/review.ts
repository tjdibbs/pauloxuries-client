import { Router } from "express";

import client from "../../lib/connection/db";
import { STATUS } from "../../lib/constants";
import isAdmin from "../../lib/security/adminAccess";

const reviewRouter = Router();

reviewRouter.get("/", isAdmin, async (req, res) => {
  try {
    let { skip = 0 } = req.query;
    let getQuery = `SELECT * from ratings LIMIT 20 OFFSET ${skip}`;

    const ratings = (await client.query(getQuery))[0];

    return res.json({ success: true, ratings });
  } catch (e: any) {
    return res.status(500).json({ error: "Error getting ratings" });
  }
});

reviewRouter.get("/_/:product", async (req, res) => {
  try {
    let { product } = req.params;
    if (!product) return res.sendStatus(402);

    let findQuery = `SELECT * FROM reviews WHERE product = '${product}'`;
    let reviews = (await client.query(findQuery))[0];

    return res.json({ success: true, reviews });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "Error fetching ratings for the specified product" });
  }
});

type Review = {
  product: string;
  review: string;
  email: string;
  name: string;
  rating: number;
};

reviewRouter.put<{}, {}, Review>("/new", async (req, res) => {
  try {
    let { product, review, email, name, rating } = req.body;

    if (!product || !review || !name || !rating || !email) {
      return res.sendStatus(STATUS.BAD_REQUEST);
    }

    let query = "INSERT INTO reviews SET ?";
    await client.query(query, [req.body]);

    res.sendStatus(STATUS.CREATED);
  } catch (e: any) {
    console.error({ e });
    return res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
  }
});

export default reviewRouter;
