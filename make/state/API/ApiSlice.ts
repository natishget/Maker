import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { RootState } from "../store";

interface ApiState {
  loginResponse: LoginResponse | null;
  registerResponse: RegisterResponse | null;
  user: User | null;
  allUsers: AllUsersResponse[] | null;
  company: Company | null;
  companies: Company[] | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface LoginResponse {
  message?: string;
  error?: string;
  access_token?: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  companyId: string;
  password?: string;
  Position?: string;
  role?: string;
}

type ProtectedUserResponse = {
  id: string;
  name: string;
  email: string;
  companyId?: string;
  company_id?: string;
};

export interface Company {
  id: string;
  name: string;
  email: string;
  tg_bot_token: string;
  tg_chat_id: number;
  createdAt: string;
}

type CompanyApiResponse = {
  id: string;
  name: string;
  email: string;
  tg_bot_token?: string;
  tgBotToken?: string;
  tg_chat_id?: number | string;
  tgChatId?: number | string;
  createdAt?: string;
};

interface AllUsersResponse {
  id: string;
  name: string;
  email: string;
  Position?: string;
  createdAt?: string;
  company: {
    id: string;
    name: string;
  };
}

const initialState: ApiState = {
  loginResponse: null,
  registerResponse: null,
  user: null,
  allUsers: null,
  company: null,
  companies: null,
  loading: false,
  initialized: false,
  error: null,
};

export const loginAsync = createAsyncThunk<
  LoginResponse,
  object,
  { rejectValue: string; dispatch: any }
>("loginAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    const loginResponse = await api.post("/auth/login", data, {
      withCredentials: true,
    });
    // after successful login, fetch user info and store it
    await dispatch(protectedRouteAsync()).unwrap();
    return loginResponse.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const registerAsync = createAsyncThunk<
  RegisterResponse,
  object,
  { rejectValue: string; dispatch: any }
>("registerAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    const registerResponse = await api.post("/auth/register", data, {
      withCredentials: true,
    });

    // after successful registration, fetch user info and store it
    await dispatch(protectedRouteAsync()).unwrap();
    return registerResponse.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Registration failed",
    );
  }
});

export const adminLoginAsync = createAsyncThunk<
  LoginResponse,
  object,
  { rejectValue: string; dispatch: any }
>("adminLoginAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    const loginResponse = await api.post("/auth/admin/login", data, {
      withCredentials: true,
    });
    // after successful login, fetch user info and store it
    await dispatch(protectedRouteAsync()).unwrap();
    return loginResponse.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const protectedRouteAsync = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  "protectedRouteAsync",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/protected", {
        withCredentials: true,
      });

      const data = response.data as ProtectedUserResponse;
      return {
        ...data,
        companyId: data.companyId || data.company_id || "",
      } as User;
    } catch (error: any) {
      console.log(
        "Protected route error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to access protected route",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { user } = (getState() as RootState).api;
      // Skip if already initialized or currently loading
      return !user;
    },
  },
);
export const getCompanyDataAsync = createAsyncThunk<
  Company,
  void,
  { rejectValue: string; state: RootState }
>(
  "getCompanyDataAsync",

  async (_, { rejectWithValue, getState }) => {
    console.log("Fetching company data...");
    try {
      const user = getState().api.user as
        | (User & { company_id?: string })
        | null;
      const companyId = user?.companyId || user?.company_id;

      if (!companyId) {
        return rejectWithValue("Company ID is missing from state");
      }

      let response;
      try {
        response = await api.get(`user/company/${companyId}`, {
          withCredentials: true,
        });
      } catch {
        // Fallback for alternate backend route shape.
        response = await api.get(`/company/${companyId}`, {
          withCredentials: true,
        });
      }
      console.log("Company data fetched:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(
        "Error fetching company data:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company data",
      );
    }
  },
);

export const getUsersDataAsync = createAsyncThunk<
  AllUsersResponse[],
  void,
  { rejectValue: string }
>("getUsersDataAsync", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/user", {
      withCredentials: true,
    });
    const data = response.data as AllUsersResponse[];
    return data;
  } catch (error: any) {
    console.log(
      "Error fetching user data:",
      error.response?.data || error.message,
    );
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user data",
    );
  }
});

export const getCompaniesDataAsync = createAsyncThunk<
  Company[],
  void,
  { rejectValue: string; state: RootState }
>("getCompaniesDataAsync", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("user/company", {
      withCredentials: true,
    });
    const data = response.data as CompanyApiResponse[];
    return data.map((company) => ({
      id: company.id,
      name: company.name,
      email: company.email,
      tg_bot_token: company.tg_bot_token || company.tgBotToken || "",
      tg_chat_id: Number(company.tg_chat_id ?? company.tgChatId ?? 0),
      createdAt: company.createdAt || "",
    }));
  } catch (error: any) {
    console.log(
      "Error fetching company data:",
      error.response?.data || error.message,
    );
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch company data",
    );
  }
});

export const addUserAsync = createAsyncThunk<
  void,
  object,
  { rejectValue: string; dispatch: any }
>("addUserAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    await api.post("auth/register", data, {
      withCredentials: true,
    });
    // after successful user addition, fetch all users again to update the list
    await dispatch(getUsersDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add user",
    );
  }
});

export const editUserAsync = createAsyncThunk<
  void,
  { user: User; id: string },
  { rejectValue: string; dispatch: any }
>("editUserAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    await api.patch(`/user/${data.id}`, data.user, {
      withCredentials: true,
    });

    // after successful user edit, fetch all users again to update the list
    await dispatch(getUsersDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to edit user",
    );
  }
});

export const deleteUserAsync = createAsyncThunk<
  void,
  string,
  { rejectValue: string; dispatch: any }
>("deleteUserAsync", async (id, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/user/${id}`, {
      withCredentials: true,
    });

    // after successful user deletion, fetch all users again to update the list
    await dispatch(getUsersDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete user",
    );
  }
});

export const addCompanyAsync = createAsyncThunk<
  void,
  { email: string; name: string; tg_bot_token: string; tg_chat_id: number },
  { rejectValue: string; dispatch: any }
>("addCompanyAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    await api.post("/auth/register-company", data, {
      withCredentials: true,
    });

    // after successful company addition, fetch all companies again to update the list
    await dispatch(getCompaniesDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add company",
    );
  }
});

export const editCompanyAsync = createAsyncThunk<
  void,
  {
    id: string;
    company: {
      email: string;
      name: string;
      tg_bot_token: string;
      tg_chat_id: number;
    };
  },
  { rejectValue: string; dispatch: any }
>("editCompanyAsync", async (data, { rejectWithValue, dispatch }) => {
  try {
    await api.patch(`/user/company/${data.id}`, data.company, {
      withCredentials: true,
    });

    // after successful company edit, fetch all companies again to update the list
    await dispatch(getCompaniesDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to edit company",
    );
  }
});

export const deleteCompanyAsync = createAsyncThunk<
  void,
  string,
  { rejectValue: string; dispatch: any }
>("deleteCompanyAsync", async (id, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/user/company/${id}`, {
      withCredentials: true,
    });

    // after successful company deletion, fetch all companies again to update the list
    await dispatch(getCompaniesDataAsync()).unwrap();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete company",
    );
  }
});

const ApiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.loginResponse = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      })

      // Admin Login
      .addCase(adminLoginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.loginResponse = action.payload;
      })
      .addCase(adminLoginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      })

      // register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.registerResponse = action.payload;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      })

      // protected route -> set user
      .addCase(protectedRouteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(protectedRouteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(protectedRouteAsync.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error =
          action.payload || action.error.message || "something went wrong";
        state.initialized = true;
      })

      // get company data
      .addCase(getCompanyDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanyDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
      })
      .addCase(getCompanyDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      });

    // get all users data
    builder
      .addCase(getUsersDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
      })
      .addCase(getUsersDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      });

    // get all companies data
    builder
      .addCase(getCompaniesDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompaniesDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(getCompaniesDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "something went wrong";
      });

    // add new user
    builder
      .addCase(addUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to add user";
      });

    // edit user
    builder
      .addCase(editUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUserAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to edit user";
      });

    // delete user
    builder
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to delete user";
      });

    // add company
    builder
      .addCase(addCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to add company";
      });

    // edit company
    builder
      .addCase(editCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCompanyAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to edit company";
      });

    // delete company
    builder
      .addCase(deleteCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompanyAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to delete company";
      });
  },
});

export const { setUser, clearUser, clearError } = ApiSlice.actions;

export default ApiSlice.reducer;

// selector helper (use in components to read user)
export const selectUser = (state: any) => state.api.user;
export const selectIsAuthenticated = (state: any) => !!state.api.user;
export const selectCompanyId = (state: any) => state.api.user?.companyId;
