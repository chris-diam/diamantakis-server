// src/routes/user.routes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  signup,
  login,
  getMe,
  updateMe,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Protect all routes after this middleware
router.use(protect);

router.get("/me", getMe);
router.patch("/updateMe", updateMe);

export default router;
