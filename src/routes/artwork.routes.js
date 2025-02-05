import express from "express";
import {
  createArtwork,
  getArtwork,
  getAllArtworks, // Changed from getArtworks to match controller
  addImagesToArtwork,
  deleteArtwork,
  updateArtwork,
  deleteArtworkImage,
  uploadArtworkImages,
} from "../controllers/artworkController.js";

const router = express.Router();

// Get routes
router.get("/", getAllArtworks); // Changed to match controller function name
router.get("/:id", getArtwork);

// Create and update routes
router.post("/", uploadArtworkImages, createArtwork);
router.patch("/:id", updateArtwork);
router.patch("/:id/images", uploadArtworkImages, addImagesToArtwork);

// Delete routes
router.delete("/:id", deleteArtwork);
router.delete("/:id/images/:imageId", deleteArtworkImage);

export default router;
