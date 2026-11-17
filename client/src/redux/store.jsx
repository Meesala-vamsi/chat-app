
import {configureStore} from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import conversationReducer from "./slices/conversationSlice";
import userReducer from "./slices/userSlice";
import messageReducer from "./slices/messageSlice";
import contactReducer from "./slices/contactSlice";

export const store = configureStore({
    reducer:{
        auth: authReducer,
        conversation: conversationReducer,
        user: userReducer,
        message: messageReducer,
        contact: contactReducer
    }
})