import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        image,
        owner: req.userId,
        city,
        state,
        address,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          image,
          owner: req.userId,
          city,
          state,
          address,
        },
        { new: true }
      );
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json(`Create shop failed: ${error}`);
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json("Shop not found");
    }
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json(`Get my shop failed: ${error}`);
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shops = await Shop.find({ city: { $regex: new RegExp(`${city}$`, "i") } }).populate('items')
    if(!shops){
      return res.status(404).json("No shops found in this city");
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json(`Get shops by city failed: ${error}`);
  } 
}
