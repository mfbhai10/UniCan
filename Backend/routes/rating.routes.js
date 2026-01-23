import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  rateItem,
  getUserRating,
  getItemRatings,
  deleteRating,
} from "../controllers/rating.controllers.js";

const ratingRouter = express.Router();

ratingRouter.post("/rate-item/:itemId", isAuth, rateItem);
ratingRouter.get("/user-rating/:itemId", isAuth, getUserRating);
ratingRouter.get("/item-ratings/:itemId", isAuth, getItemRatings);
ratingRouter.delete("/delete-rating/:itemId", isAuth, deleteRating);

export default ratingRouter;
