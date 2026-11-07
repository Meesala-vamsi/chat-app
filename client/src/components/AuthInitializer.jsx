import React from 'react'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { initializeAuth } from '../redux/slices/authSlice';

const AuthInitializer = ({children}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(initializeAuth()).then((response) => {
            console.log(response, "helloResponse")
        })
    }, [dispatch])

    return children
}

export default AuthInitializer
