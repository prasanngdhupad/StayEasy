import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

/* =====================================================
   GET ALL PROPERTIES
===================================================== */
export const getProduct = createAsyncThunk(
  "product/getProduct",
  // ----------------------------------------------------------------------
  // FIX: Add minPrice, maxPrice, and sort to the destructured arguments
  // ----------------------------------------------------------------------
  async ({ keyword, page = 1, category, minPrice, maxPrice, sort } = {}, { rejectWithValue }) => {
    try {
      let link = `/api/products?page=${page}`;

      // keyword search (city, locality, title)
      if (keyword) {
        link += `&keyword=${encodeURIComponent(keyword)}`;
      }

      // reuse category param as propertyType (PG / Hostel / Room)
      if (category) {
        link += `&propertyType=${category}`;
      }

      // ----------------------------------------------------------------------
      // FIX: Include price and sort parameters in the API URL
      // ----------------------------------------------------------------------
      if (minPrice) {
        link += `&minPrice=${minPrice}`;
      }

      if (maxPrice) {
        link += `&maxPrice=${maxPrice}`;
      }

      if (sort) {
        link += `&sort=${sort}`;
      }
      // ----------------------------------------------------------------------

      const { data } = await axios.get(link);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

/* =====================================================
   GET SINGLE PROPERTY
===================================================== */
export const getProductDetails = createAsyncThunk(
  "product/getProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/product/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

/* =====================================================
   CREATE / UPDATE REVIEW
===================================================== */
export const createReview = createAsyncThunk(
  "product/createReview",
  async ({ rating, comment, productId }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const { data } = await axios.put(
        "/api/review",
        { rating, comment, propertyId: productId },
        config
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */
const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    productCount: 0,
    loading: false,
    error: null,
    product: null,
    resultsPerPage: 4,
    totalPages: 0,
    reviewSuccess: false,
    reviewLoading: false,
  },
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },
    removeSuccess: (state) => {
      state.reviewSuccess = false;
    },
  },
  extraReducers: (builder) => {
    /* GET ALL PROPERTIES */
    builder
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.properties || [];
        state.productCount = action.payload?.propertyCount || 0;
        state.resultsPerPage =
          action.payload?.resultsPerPage || 4;
        state.totalPages = action.payload?.totalPages || 0;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.productCount = 0;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong";
      });

    /* GET SINGLE PROPERTY */
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload?.property || null;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong";
      });

    /* CREATE REVIEW */
    builder
      .addCase(createReview.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.reviewLoading = false;
        state.reviewSuccess = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong";
      });
  },
});

export const { removeErrors, removeSuccess } =
  productSlice.actions;

export default productSlice.reducer;
