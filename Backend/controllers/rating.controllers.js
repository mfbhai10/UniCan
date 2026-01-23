import Rating from "../models/rating.model.js";
import Item from "../models/item.model.js";

// Add or update rating for an item
export const rateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user has already rated this item
    let existingRating = await Rating.findOne({ user: userId, item: itemId });

    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();

      // Update item's average rating
      const totalRating =
        item.rating.average * item.rating.count - oldRating + rating;
      item.rating.average = totalRating / item.rating.count;
    } else {
      // Create new rating
      existingRating = await Rating.create({
        user: userId,
        item: itemId,
        rating,
        review,
      });

      // Update item's rating
      const totalRating = item.rating.average * item.rating.count + rating;
      item.rating.count += 1;
      item.rating.average = totalRating / item.rating.count;
    }

    await item.save();

    // Populate the rating with user info
    await existingRating.populate("user", "fullName");

    return res.status(200).json({
      message: "Rating submitted successfully",
      rating: existingRating,
      itemRating: {
        average: item.rating.average,
        count: item.rating.count,
      },
    });
  } catch (error) {
    console.error("Rate item error:", error);
    return res.status(500).json({ message: `Rate item failed: ${error}` });
  }
};

// Get user's rating for a specific item
export const getUserRating = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findOne({ user: userId, item: itemId });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    return res.status(200).json(rating);
  } catch (error) {
    console.error("Get user rating error:", error);
    return res
      .status(500)
      .json({ message: `Get user rating failed: ${error}` });
  }
};

// Get all ratings for an item
export const getItemRatings = async (req, res) => {
  try {
    const { itemId } = req.params;

    const ratings = await Rating.find({ item: itemId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Get item ratings error:", error);
    return res
      .status(500)
      .json({ message: `Get item ratings failed: ${error}` });
  }
};

// Delete rating
export const deleteRating = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    const rating = await Rating.findOne({ user: userId, item: itemId });
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update item's rating
    const totalRating = item.rating.average * item.rating.count - rating.rating;
    item.rating.count -= 1;

    if (item.rating.count > 0) {
      item.rating.average = totalRating / item.rating.count;
    } else {
      item.rating.average = 0;
    }

    await item.save();
    await Rating.findByIdAndDelete(rating._id);

    return res.status(200).json({
      message: "Rating deleted successfully",
      itemRating: {
        average: item.rating.average,
        count: item.rating.count,
      },
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    return res.status(500).json({ message: `Delete rating failed: ${error}` });
  }
};
