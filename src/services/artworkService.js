import Artwork from "../models/Artwork.js";
import ApiError from "../utils/ApiError.js";

export const artworkService = {
  async getAllArtworks(query) {
    const { category, sort, page = 1, limit = 10 } = query;

    // Build query
    let queryObj = {};
    if (category) queryObj.category = category;

    let artworks = Artwork.find(queryObj);

    // Sorting
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      artworks = artworks.sort(sortBy);
    } else {
      artworks = artworks.sort("-createdAt");
    }

    // Pagination
    const skip = (page - 1) * limit;
    artworks = artworks.skip(skip).limit(Number(limit));

    return await artworks;
  },

  async getArtworkById(id) {
    return await Artwork.findById(id);
  },

  async createArtwork(artworkData) {
    return await Artwork.create(artworkData);
  },

  async updateArtwork(id, artworkData) {
    return await Artwork.findByIdAndUpdate(id, artworkData, {
      new: true,
      runValidators: true,
    });
  },

  async deleteArtwork(id) {
    return await Artwork.findByIdAndDelete(id);
  },
};
