import {createAsyncThunk, createSlice} from "@reduxjs/toolkit"
import axios from "axios";

const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true,
    error: null
}

export const loginService = createAsyncThunk("chat/login", async (userData, thunkApi) => {
    try{
        const {email, password} = userData;
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
            email,
            password
        }, {withCredentials: true})

        return response.data;
    }catch(error){
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message || "Failed to login");
    }
})

export const signupService = createAsyncThunk("chat/signup", async (userData, thunkApi) => {
    try{
        const {email, password, firstName, lastName} = userData;
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
            email,
            password,
            firstName,
            lastName
        })

        return response.data;
    }catch(error){
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message || "Failed to login");
    }
});

export const initializeAuth = createAsyncThunk("chat/refresh", async (_, thunkApi) => {
    try{
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {}, {withCredentials: true})

        return response.data;
    }catch(error){
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message || "Failed to login");
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{

    },

    extraReducers: (builder) => {
        builder.addCase(loginService.pending, (state) => {
            state.isLoading = true
            state.error= null
        })
        .addCase(loginService.fulfilled, (state, action) => {
            state.isLoading = false
            state.isAuthenticated = true
            state.accessToken = action.payload.data?.accessToken ?? action.payload.accessToken
            state.user = action.payload.data?.user ?? action.payload.user
        })
        .addCase(loginService.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload || action.error.message
        })

        builder.addCase(signupService.pending, (state) => {
            state.isLoading = true
            state.error= null
        })
        .addCase(signupService.fulfilled, (state, action) => {
            state.isLoading = false
            // state.isAuthenticated = true
            // state.accessToken = action.payload.data?.accessToken ?? action.payload.accessToken
        })
        .addCase(signupService.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload || action.error.message
        })

        .addCase(initializeAuth.pending, (state) => {
            state.isLoading = true
            state.error= null
            state.isCheckingAuth = true
        })
        .addCase(initializeAuth.fulfilled, (state, action) => {
            state.isLoading = false
            state.isAuthenticated = true
            state.accessToken = action.payload.data?.accessToken ?? action.payload.accessToken
            state.isCheckingAuth=false
            state.user = action.payload.data?.user ?? action.payload.user
        })
        .addCase(initializeAuth.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload || action.error.message
            state.isCheckingAuth=false
        })
    }
})


export default authSlice.reducer;