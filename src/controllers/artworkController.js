import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import Artwork from "../models/Artwork.js";
import { upload } from "../middleware/upload.js";
import multer from "multer";

// Create wrapper for multer middleware
const multerMiddleware = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({
        status: "error",
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({
        status: "error",
        message: "Problem with file upload",
      });
    }
    // Everything went fine.
    next();
  });
};

export const uploadArtworkImages = multerMiddleware;

export const getAllArtworks = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const artworks = await Artwork.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: artworks.length,
    data: { artworks },
  });
});

export const getArtwork = catchAsync(async (req, res) => {
  const { id } = req.params;

  const artwork = await Artwork.findById(id);

  if (!artwork) {
    throw new ApiError(404, "Artwork not found");
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const createArtwork = catchAsync(async (req, res) => {
  console.log("Files received:", req.files);
  console.log("Body received:", req.body);

  const artworkData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    materials: req.body.materials ? JSON.parse(req.body.materials) : [],
    dimensions: {
      width: req.body.dimensions?.width,
      height: req.body.dimensions?.height,
      depth: req.body.dimensions?.depth,
    },
    images: [],
  };

  if (req.files && req.files.length > 0) {
    artworkData.images = req.files.map((file) => ({
      data: file.buffer.toString("base64"),
      contentType: file.mimetype,
    }));
  }

  const artwork = await Artwork.create(artworkData);

  res.status(201).json({
    status: "success",
    data: { artwork },
  });
});

export const updateArtwork = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updateData = { ...req.body };
  delete updateData.images;

  if (updateData.materials) {
    updateData.materials = JSON.parse(updateData.materials);
  }

  const artwork = await Artwork.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!artwork) {
    throw new ApiError(404, "Artwork not found");
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const deleteArtwork = catchAsync(async (req, res) => {
  const { id } = req.params;

  const artwork = await Artwork.findByIdAndDelete(id);

  if (!artwork) {
    throw new ApiError(404, "Artwork not found");
  }

  res.status(200).json({
    status: "success",
    message: "Artwork successfully deleted",
    data: null,
  });
});

// Add the missing export
export const addImagesToArtwork = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one image");
  }

  const images = req.files.map((file) => ({
    data: file.buffer.toString("base64"),
    contentType: file.mimetype,
  }));

  const artwork = await Artwork.findByIdAndUpdate(
    id,
    { $push: { images: { $each: images } } },
    { new: true }
  );

  if (!artwork) {
    throw new ApiError(404, "Artwork not found");
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});

export const deleteArtworkImage = catchAsync(async (req, res) => {
  const { id, imageId } = req.params;

  const artwork = await Artwork.findByIdAndUpdate(
    id,
    { $pull: { images: { _id: imageId } } },
    { new: true }
  );

  if (!artwork) {
    throw new ApiError(404, "Artwork not found");
  }

  res.status(200).json({
    status: "success",
    data: { artwork },
  });
});
