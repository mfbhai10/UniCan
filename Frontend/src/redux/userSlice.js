import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    selectedCategory: "All",
    selectedShop: null,
    searchQuery: "",
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },

    removeCartItem: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter((i) => i.id !== id);
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
    resetUserState: (state) => {
      state.userData = null;
      state.currentCity = null;
      state.currentState = null;
      state.currentAddress = null;
      state.shopInMyCity = null;
      state.itemsInMyCity = null;
      state.cartItems = [];
      state.totalAmount = 0;
      state.selectedCategory = "All";
      state.selectedShop = null;
      state.searchQuery = "";
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  setSelectedCategory,
  setSelectedShop,
  setSearchQuery,
  setCartItems,
  setTotalAmount,
  clearCart,
  resetUserState,
} = userSlice.actions;
export default userSlice.reducer;
