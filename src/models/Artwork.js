import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["painting", "sculpture", "jewelry"],
    },
    price: { type: Number, required: true },
    images: [
      {
        data: { type: String, required: true }, // base64
        contentType: { type: String, required: true },
      },
    ],
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },
    materials: [String],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Artwork", artworkSchema);
