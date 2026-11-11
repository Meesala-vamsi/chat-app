import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

const initialState = {
    users: [],
    page: 1,
    hasMore: false,
    isLoading: false,
    error: null,
    onlineUserIds: []
}

// page 1 replaces the list, later pages are appended (see reducer below)
export const searchUsers = createAsyncThunk("user/search", async ({ search, page = 1 }, thunkApi) => {
    try {
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
            params: { search, page, limit: 10 },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message || "Failed to search users")
    }
})

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // keep presence data: it comes from the socket, not from the search
        clearUsers: (state) => ({ ...initialState, onlineUserIds: state.onlineUserIds }),
        
        onlineUsers: (state, { payload }) => {
            state.onlineUserIds = payload.onlineUsers
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchUsers.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                const { users, page, hasMore } = action.payload.data
                state.isLoading = false
                state.users = page === 1 ? users : [...state.users, ...users]
                state.page = page
                state.hasMore = hasMore
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || action.error.message
            })
    }
})

export const { clearUsers, onlineUsers } = userSlice.actions
export default userSlice.reducer
