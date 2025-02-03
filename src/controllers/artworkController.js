// src/controllers/artworkController.js
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import Artwork from "../models/Artwork.js";
import { artworkService } from "../services/artworkService.js";

export const getArtworks = catchAsync(async (req, res) => {
  const artworks = await artworkService.getAllArtworks(req.query);

  res.status(200).json({
    status: "success",
    results: artworks.length,
    data: { artworks },
  });
});

export const getArtwork = catchAsync(async (req, res, next) => {
  const artwork = await artworkService.getArtworkById(req.params.id);

  if (!artwork) {
    return next(new ApiError(404, "Artwork not found"));
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const createArtwork = catchAsync(async (req, res) => {
  const artwork = await artworkService.createArtwork(req.body);

  res.status(201).json({
    status: "success",
    data: { artwork },
  });
});

export const updateArtwork = catchAsync(async (req, res, next) => {
  const artwork = await artworkService.updateArtwork(req.params.id, req.body);

  if (!artwork) {
    return next(new ApiError(404, "Artwork not found"));
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const uploadImages = catchAsync(async (req, res) => {
  const artworkId = req.params.id;
  const images = [];

  for (const file of req.files) {
    const imageBase64 = file.buffer.toString("base64");
    images.push({
      data: imageBase64,
      contentType: file.mimetype,
    });
  }

  const artwork = await Artwork.findByIdAndUpdate(
    artworkId,
    { $push: { images: { $each: images } } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const deleteArtwork = catchAsync(async (req, res, next) => {
  const artwork = await artworkService.deleteArtwork(req.params.id);

  if (!artwork) {
    return next(new ApiError(404, "Artwork not found"));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
