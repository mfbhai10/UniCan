import Cart from "../models/cart.model.js";
import Item from "../models/item.model.js";

const computeTotal = (cart) =>
  cart.items.reduce((sum, it) => sum + it.priceAtAddition * it.quantity, 0);

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate({ path: "items.item", model: "Item" })
      .populate({
        path: "items.shop",
        model: "Shop",
        populate: { path: "owner", model: "User" },
      });

    return res.json({
      success: true,
      cart: cart || { items: [], totalAmount: 0 },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch cart" });
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "itemId is required" });
    }
    const qty = Number(quantity) || 1;

    const item = await Item.findById(itemId).populate("shop");
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const existing = cart.items.find((it) => it.item.toString() === itemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        item: item._id,
        shop: item.shop?._id,
        quantity: qty,
        priceAtAddition: item.price,
      });
    }

    cart.totalAmount = computeTotal(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({ path: "items.item", model: "Item" })
      .populate({
        path: "items.shop",
        model: "Shop",
        populate: { path: "owner", model: "User" },
      });

    return res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error("Add item to cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add item" });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "itemId and quantity are required" });
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res
        .status(400)
        .json({ success: false, message: "quantity must be >= 0" });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const idx = cart.items.findIndex((it) => it.item.toString() === itemId);
    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    if (qty === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = qty;
    }

    cart.totalAmount = computeTotal(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({ path: "items.item", model: "Item" })
      .populate({
        path: "items.shop",
        model: "Shop",
        populate: { path: "owner", model: "User" },
      });

    return res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update quantity" });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "itemId is required" });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const initialLen = cart.items.length;
    cart.items = cart.items.filter((it) => it.item.toString() !== itemId);

    if (cart.items.length === initialLen) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.totalAmount = computeTotal(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({ path: "items.item", model: "Item" })
      .populate({
        path: "items.shop",
        model: "Shop",
        populate: { path: "owner", model: "User" },
      });

    return res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.json({ success: true, cart: { items: [], totalAmount: 0 } });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return res.json({ success: true, cart: { items: [], totalAmount: 0 } });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to clear cart" });
  }
};
