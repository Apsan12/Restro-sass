import jwt from "jsonwebtoken";
import { AccountRole } from "../models/Account.js";

interface JwtPayload {
  userId: string;
  role: AccountRole;
  restaurantId?: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  });
};

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.verify(token, secret) as JwtPayload;
};
