import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

const initialState = {
    contacts: [],
    page: 1,
    hasMore: false,
    total: 0,
    isLoading: false,
    error: null,
    selectedContact: null,
    isContactLoading: false,
    contactError: null,
    media: [],
    mediaCursor: null,
    mediaHasMore: false,
    isMediaLoading: false
}

const authHeader = (thunkApi) => ({ Authorization: `Bearer ${thunkApi.getState().auth.accessToken}` })

export const fetchContacts = createAsyncThunk("contact/fetchContacts", async ({ search = "", page = 1 }, thunkApi) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
            params: { search, page, limit: 15 },
            headers: authHeader(thunkApi)
        })
        return response.data
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load contacts")
    }
})

export const fetchContactDetails = createAsyncThunk("contact/fetchContactDetails", async (userId, thunkApi) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`, {
            headers: authHeader(thunkApi)
        })
        return response.data
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load contact")
    }
})

export const fetchSharedMedia = createAsyncThunk("contact/fetchSharedMedia", async ({ userId, before }, thunkApi) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/media`, {
            params: { before, limit: 12 },
            headers: authHeader(thunkApi)
        })
        return { ...response.data, loadedMore: Boolean(before) }
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load shared media")
    }
})

const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        clearSelectedContact: (state) => {
            state.selectedContact = null
            state.contactError = null
            state.media = []
            state.mediaCursor = null
            state.mediaHasMore = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContacts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                const { users, page, hasMore, total } = action.payload.data
                state.isLoading = false
                state.contacts = page === 1 ? users : [...state.contacts, ...users]
                state.page = page
                state.hasMore = hasMore
                state.total = total
            })
            .addCase(fetchContacts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload || action.error.message
            })
            .addCase(fetchContactDetails.pending, (state) => {
                state.isContactLoading = true
                state.contactError = null
                state.selectedContact = null
            })
            .addCase(fetchContactDetails.fulfilled, (state, action) => {
                state.isContactLoading = false
                state.selectedContact = action.payload.data.user
            })
            .addCase(fetchContactDetails.rejected, (state, action) => {
                state.isContactLoading = false
                state.contactError = action.payload || action.error.message
            })
            .addCase(fetchSharedMedia.pending, (state, action) => {
                state.isMediaLoading = true
                if (!action.meta.arg.before) {
                    state.media = []
                    state.mediaCursor = null
                    state.mediaHasMore = false
                }
            })
            .addCase(fetchSharedMedia.fulfilled, (state, action) => {
                const { media, nextCursor, hasMore } = action.payload.data
                state.isMediaLoading = false
                state.media = action.payload.loadedMore ? [...state.media, ...media] : media
                state.mediaCursor = nextCursor
                state.mediaHasMore = hasMore
            })
            .addCase(fetchSharedMedia.rejected, (state) => {
                state.isMediaLoading = false
            })
    }
})

export const { clearSelectedContact } = contactSlice.actions
export default contactSlice.reducer
