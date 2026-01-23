import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerSlice from "./ownerSlice";
import orderSlice from "./orderSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    owner: ownerSlice,
    order: orderSlice,
  },
});
