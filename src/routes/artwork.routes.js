// src/routes/artwork.routes.js
import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  getArtworks,
  getArtwork,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from "../controllers/artworkController.js";

const router = express.Router();

// Public routes
router.get("/", getArtworks);
router.get("/:id", getArtwork);

// Protected routes (need authentication)
router.use(protect);

// Admin only routes
router.use(restrictTo("admin"));

router.post("/", upload.array("images", 5), createArtwork);
router.patch("/:id", upload.array("images", 5), updateArtwork);
router.delete("/:id", deleteArtwork);

// For categories
router.get("/category/:category", getArtworks);

export default router;
