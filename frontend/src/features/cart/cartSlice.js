import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* =====================================================
   ADD / UPDATE BOOKING ITEM
===================================================== */
export const addItemsToCart = createAsyncThunk(
  "cart/addItemsToCart",
  async (
    { id, name, image, quantity, price, roomType },
    { rejectWithValue }
  ) => {
    try {
      return {
        product: id,
        name,        // ✅ STORE NAME
        image,       // ✅ STORE IMAGE URL
        quantity,
        price,
        roomType,
      };
    } catch (error) {
      return rejectWithValue("Failed to add booking");
    }
  }
);

/* =====================================================
   SLICE
===================================================== */
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
    loading: false,
    error: null,
    success: false,
    message: null,
    shippingInfo: JSON.parse(localStorage.getItem("shippingInfo")) || {},
  },

  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },
    removeMessage: (state) => {
      state.message = null;
      state.success = false;
    },

    removeItemFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product !== action.payload
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
      localStorage.setItem(
        "shippingInfo",
        JSON.stringify(state.shippingInfo)
      );
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
      localStorage.removeItem("shippingInfo");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(addItemsToCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(addItemsToCart.fulfilled, (state, action) => {
        const item = action.payload;

        const existingItem = state.cartItems.find(
          (i) => i.product === item.product
        );

        if (existingItem) {
          existingItem.quantity = item.quantity;
          existingItem.price = item.price;
          existingItem.roomType = item.roomType;
          state.message = "Booking updated";
        } else {
          state.cartItems.push(item);
          state.message = "Property added to booking";
        }

        state.loading = false;
        state.success = true;

        localStorage.setItem(
          "cartItems",
          JSON.stringify(state.cartItems)
        );
      })

      .addCase(addItemsToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  removeErrors,
  removeMessage,
  removeItemFromCart,
  saveShippingInfo,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
