import React from 'react'
import { useSelector } from 'react-redux'
import { authStatus, checkRefreshStatus } from '../redux/selectors/auth.selector'
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const isAuthenticated = useSelector(authStatus);
    const isChekingAuth = useSelector(checkRefreshStatus);
    if(isChekingAuth){
        return <div>Checking Refresh...</div>
    }
    if(isAuthenticated){
        return <Navigate to="/" replace/>
    }

    return <Outlet/>
}

export default PublicRoute
