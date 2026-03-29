import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./API/ApiSlice";
import cartReducer from "./cart/cartSlice";

export const store = configureStore({
  reducer: {
    api: apiReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
