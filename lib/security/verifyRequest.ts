import { Request, Response, NextFunction } from "express";

export function verifyRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export function ensureIsAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {}
