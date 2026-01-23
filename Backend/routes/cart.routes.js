import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../controllers/cart.controllers.js";

const cartRouter = express.Router();

cartRouter.get("/", isAuth, getCart);
cartRouter.post("/add", isAuth, addItemToCart);
cartRouter.put("/update", isAuth, updateCartItemQuantity);
cartRouter.delete("/remove/:itemId", isAuth, removeItemFromCart);
cartRouter.delete("/clear", isAuth, clearCart);

export default cartRouter;
