// src/utils/jwt.js
import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: "30d",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
