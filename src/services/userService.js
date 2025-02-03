import User from "../models/User.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const userService = {
  async createUser(userData) {
    return await User.create(userData);
  },

  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: "30d",
    });
  },

  async validateUser(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return null;
    }
    return user;
  },
};
