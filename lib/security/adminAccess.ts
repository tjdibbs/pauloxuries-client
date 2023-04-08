import { Response, Request, NextFunction } from "express";

export default function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let bearer = req.headers["Bearers"];

    next();
  } catch (e: any) {
    res.sendStatus(401);
  }
}
