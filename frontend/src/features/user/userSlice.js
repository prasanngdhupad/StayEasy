import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const register = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/register",
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);



export const login = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Login failed.Please try again later"
      );
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/profile", {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to load user profile. Please try again later",
        }
      );
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/logout",
        {},
        { withCredentials: true }
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout Failed");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        "/api/profile/update",
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);


export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.put(
        "/api/password/update",
        formData,
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Password Update failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post("/api/password/forgot", email, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Email Sent Failed" }
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ token, userData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/password/reset/${token}`, // ✅ FIXED
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
    loading: false,
    error: null,
    success: false,
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
    message: null,
  },
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },
    removeSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(register.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.success = action.payload.success;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem(
          "isAuthenticated",
          JSON.stringify(state.isAuthenticated)
        );
      })
      .addCase(register.rejected, (state, action) => {
        (state.loading = false),
          (state.error =
            action.payload?.message ||
            "Registration failed. Please try again later");
        state.user = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(login.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(login.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.success = action.payload.success;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem(
          "isAuthenticated",
          JSON.stringify(state.isAuthenticated)
        );
      })
      .addCase(login.rejected, (state, action) => {
        (state.loading = false),
          (state.error =
            action.payload?.message || "Login failed. Please try again later");
        state.user = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(loadUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem(
          "isAuthenticated",
          JSON.stringify(state.isAuthenticated)
        );
      })
      .addCase(loadUser.rejected, (state, action) => {
        (state.loading = false),
          (state.error =
            action.payload?.message ||
            "Failed to load user profile. Please try again later");

        if (action.payload?.statusCode === 401) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
        }
      });

    builder
      .addCase(logout.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(logout.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      })
      .addCase(logout.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload?.message || "Logout failed");
      });

    builder
      .addCase(updateProfile.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.user = action.payload?.user || null;
        state.success = action.payload?.success;
        state.message = action.payload?.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload?.message || "Logout failed");
      });

    builder
      .addCase(updatePassword.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.success = action.payload?.success;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload?.message || "Password Update failed");
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.success = action.payload?.success;
        state.message = action.payload?.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload?.message || "Email Sent Failed");
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        (state.loading = false), (state.error = null);
        state.success = action.payload?.success;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload?.message || "Email Sent Failed");
      });
  },
});

export const { removeErrors, removeSuccess } = userSlice.actions;
export default userSlice.reducer;
