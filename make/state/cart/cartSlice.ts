import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  customerName: string;
  customerPhone: string;
  product: string;
  quantity: number;
  description: string;
  totalCost: string;
  singleItemCost: string;
  salesAgent: string;
  companyName: string;
  companyEmail: string;
  createdAt: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const CartSlice = createSlice({
  name: "CartSlice",
  initialState,
  reducers: {
    AddItem: (state, action: PayloadAction<CartItem | { item: CartItem }>) => {
      const item =
        "item" in action.payload ? action.payload.item : action.payload;
      state.items.push(item);
    },
    RemoveItem: (state, action: PayloadAction<string | CartItem>) => {
      const itemId =
        typeof action.payload === "string" ? action.payload : action.payload.id;

      state.items = state.items.filter((item) => item.id !== itemId);
    },
    makeEmpty: (state) => {
      state.items = [];
    },
  },
});

export const { AddItem, RemoveItem, makeEmpty } = CartSlice.actions;
export default CartSlice.reducer;
