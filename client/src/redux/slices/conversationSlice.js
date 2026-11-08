import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"



const initialState = {
    directConversations:[],
    groupConversations: [],
    isLoading: false,
    error: null
}


export const fetchConversations = createAsyncThunk("chat/conversations", async (_, thunkApi) => {
    try{   
        const token = thunkApi.getState().auth.accessToken
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/conversation`,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }catch(error){
        return thunkApi.rejectWithValue({
            status: false,
            message: error.payload.data.message || "Failed to fetch conversations"
        })
    }
})


const conversation = createSlice({
    name: "conversation",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder.addCase(fetchConversations.pending, (state) => {
            state.isLoading=true;
        })
        .addCase(fetchConversations.fulfilled, (state, payload) => {
            console.log("🚀 ~ payload:",payload.payload, payload?.data?.conversations.filter((eachConversation) => eachConversation))
            
            state.isLoading=false;
            state.directConversations = payload?.payload?.data?.conversations.filter((eachConversation) => eachConversation.type === "direct"),
            state.groupConversations = payload?.data?.conversations.filter((eachConversation) => eachConversation.type === "group")
        })
        .addCase(fetchConversations.rejected, (state,payload) => {
            state.isLoading=false;
            state.error = payload.message;
        })
    }
})

export default conversation.reducer;

