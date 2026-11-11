import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

const initialState = {
    messages: [],
    nextCursor: null,   // id of the oldest loaded message, used to load older ones
    hasMore: false,     // true when older messages exist on the server
    isLoading: false,
    isSending: false,
    error: null
}

// Load messages of a conversation. Pass `before` (the nextCursor) to load older messages.
export const fetchMessages = createAsyncThunk("message/fetchMessages", async ({ conversationId, before }, thunkApi) => {
    try {
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}`, {
            params: { before, limit: 20 },
            headers: { Authorization: `Bearer ${token}` }
        })
        return { ...response.data, loadedOlder: Boolean(before) }
    } catch (error) {
        return thunkApi.rejectWithValue({
            status: false,
            message: error.response?.data?.message || "Failed to fetch messages"
        })
    }
})

export const sendMessage = createAsyncThunk("message/sendMessage", async ({ conversationId, content, messageType = "text" }, thunkApi) => {
    try {
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message/send`,
            { conversationId, content, messageType },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    } catch (error) {
        return thunkApi.rejectWithValue({
            status: false,
            message: error.response?.data?.message || "Failed to send message"
        })
    }
})

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        // for new messages that arrive over the socket
        addMessage: (state, action) => {
            const alreadyAdded = state.messages.some((message) => message._id === action.payload._id)
            if (!alreadyAdded) {
                state.messages.push(action.payload)
            }
        },
        clearMessages: () => initialState,
        handleReadStatus: (state, action) => {
            const {conversationId, readBy, readAt} = action;
            state.messages = state.messages.map((message) => {
                const alreadyRead = message.readBy.some(
                    (item) => item.userId === readBy
                );
                console.log("🚀 ~ alreadyRead:", alreadyRead)

                if (!alreadyRead) {
                    message.readBy.push({
                        userId: readBy,
                        readAt
                    });
                }

                return message;
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state, action) => {
                state.isLoading = true
                state.error = null
                // opening a different conversation: drop the previous one's messages
                if (!action.meta.arg.before) {
                    state.messages = []
                }
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                const { messages, nextCursor, hasMore } = action.payload.data
                state.isLoading = false
                // older messages go above the ones already loaded
                state.messages = action.payload.loadedOlder ? [...messages, ...state.messages] : messages
                state.nextCursor = nextCursor
                state.hasMore = hasMore
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload?.message || action.error.message
            })
            .addCase(sendMessage.pending, (state) => {
                state.isSending = true
                state.error = null
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isSending = false
                const isAlreadyExists = state.messages.filter((eachMessage) => eachMessage._id === action.payload.data.message._id)
                // the sender's own message; the server returns senderId as a plain id, which the UI handles
                if (!isAlreadyExists) {
                    state.messages.push(action.payload.data.message)
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSending = false
                state.error = action.payload?.message || action.error.message
            })
    }
})

export const { addMessage, clearMessages, handleReadStatus } = messageSlice.actions
export default messageSlice.reducer
