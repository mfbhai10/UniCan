import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    const item = await Item.create({
      name,
      image,
      shop: shop._id,
      category,
      foodType,
      price,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    })
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json(`Add item failed: ${error}`);
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        image,
        category,
        foodType,
        price,
      },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });
    return res.status(200).json(shop);

  } catch (error) {
    return res.status(500).json(`Edit item failed: ${error}`);
  }
};


export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId)
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json(`Get item failed: ${error}`);
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter(i => i._id.toString() !== itemId);  //9:34:55
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    })
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json(`Delete item failed: ${error}`);
  }
};

export const getItemsByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }
    const shops = await Shop.find({ city: { $regex: new RegExp(`${city}$`, "i") } }).populate('items')
    if(!shops){
      return res.status(404).json("No shops found in this city");
    }
    const shopIds = shops.map(shop => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json(`Get items by city failed: ${error}`);
  } 
}