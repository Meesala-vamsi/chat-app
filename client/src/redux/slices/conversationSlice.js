import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"



const initialState = {
    conversations: [],
    isLoading: false,
    error: null,
    unreadCounts: {}
}


export const fetchConversations = createAsyncThunk("chat/fetchConversations", async (_, thunkApi) => {
    try {
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/conversation`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        return thunkApi.rejectWithValue({
            status: false,
            message: error.response?.data?.message || "Failed to fetch conversations"
        })
    }
})

export const createConversation = createAsyncThunk("chat/createConversations", async (conversationData, thunkApi) => {
    try {
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/conversation`, conversationData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        return response.data;
    } catch (error) {
        return thunkApi.rejectWithValue({
            status: false,
            message: error.response?.data?.message || "Failed to create conversation"
        })
    }
})

const conversation = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        incrementUnread: (state, { payload }) => {
            const {conversationId, unreadCount} = payload
            state.conversations = state.conversations.map((eachConversation) => {
                if(eachConversation._id === conversationId){
                    return {...eachConversation, "unreadCounts" : unreadCount}
                }
                return eachConversation
            })
        },
        clearUnread: (state, { payload }) => {
            state.conversations = state.conversations.map((eachConversation) => {
                if(eachConversation._id === payload){
                    return {...eachConversation, "unreadCounts" : 0}
                }
                return eachConversation
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations = action.payload?.data?.conversations ?? [];
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || action.error.message;
            })
            .addCase(createConversation.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createConversation.fulfilled, (state, action) => {
                state.isLoading = false;
                // add the new conversation to the top of the list if it is not there already
                const newConversation = action.payload?.data?.conversation;
                const alreadyInList = state.conversations.some((conversation) => conversation._id === newConversation?._id);
                if (newConversation && !alreadyInList) {
                    state.conversations.unshift(newConversation);
                }
            })
            .addCase(createConversation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || action.error.message;
            })
    }
})
export const { incrementUnread, clearUnread } = conversation.actions;
export default conversation.reducer;
