import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    userOrders: [],
    ownerOrders: [],
    currentOrder: null,
    loading: false,
  },
  reducers: {
    setUserOrders: (state, action) => {
      state.userOrders = action.payload;
    },
    setOwnerOrders: (state, action) => {
      state.ownerOrders = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setUserOrders,
  setOwnerOrders,
  setCurrentOrder,
  setOrderLoading,
} = orderSlice.actions;

export default orderSlice.reducer;
