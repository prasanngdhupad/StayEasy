import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ ALL THUNKS (FIXED)
export const fetchAdminProducts = createAsyncThunk(
  "admin/fetchAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/admin/products", { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Error fetching properties" });
    }
  }
);

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/admin/product", productData, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Creation failed" });
    }
  }
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/admin/product/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Update failed" });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/product/${productId}`, { withCredentials: true });
      return { productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Delete failed" });
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/admin/users", { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch users" });
    }
  }
);

export const getSingleUser = createAsyncThunk(
  "admin/getSingleUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/admin/user/${userId}`, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch user" });
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/admin/user/${userId}`, { role }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Role update failed" });
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/admin/user/${userId}`, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Delete failed" });
    }
  }
);

// ✅ SINGLE extraReducers (NO NESTING!)
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    products: [],
    success: false,
    loading: false,
    error: null,
    product: {},
    deleting: {},
    users: [],
    user: {},
    message: null,
  },
  reducers: {
    removeErrors: (state) => { state.error = null; },
    removeSuccess: (state) => { state.success = false; },
    clearMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    // PRODUCTS
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.properties || [];
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching properties";
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false; state.success = true;
        if (action.payload?.property) state.products.push(action.payload.property);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Creation failed";
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false; state.success = true;
        state.product = action.payload?.property || {};
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Update failed";
      })

      .addCase(deleteProduct.pending, (state, action) => {
        state.deleting[action.meta.arg] = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const productId = action.payload?.productId ?? action.meta.arg;
        delete state.deleting[productId];
        state.products = state.products.filter(p => p._id !== productId);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleting[action.meta.arg] = false;
        state.error = action.payload?.message || "Delete failed";
      })

      // USERS
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })

      .addCase(getSingleUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || {};
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user";
      })

      .addCase(updateUserRole.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false; state.success = true;
        state.user = action.payload.user || {};
        state.message = action.payload.message || "Role updated";
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Role update failed";
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false; state.message = action.payload.message || "User deleted";
        state.users = state.users.filter(u => u._id !== action.meta.arg);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Delete failed";
      });
  },
});

export const { removeErrors, removeSuccess, clearMessage } = adminSlice.actions;
export default adminSlice.reducer;
