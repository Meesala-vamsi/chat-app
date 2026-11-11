import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const SignupPage = lazy(() => import("./pages/SignupPage"))
const HomePage = lazy(() => import("./pages/HomePage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
const PublicRoute = lazy(() => import("./components/PublicRoute"))
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {io} from "socket.io-client"
import {useDispatch, useSelector} from "react-redux"
import { loginAccessToken } from './redux/selectors/auth.selector'
import { socket } from './utils/socket'
import { onlineUsers } from './redux/slices/userSlice'
const App = () => {
  const accessToken = useSelector(loginAccessToken)
  const dispatch = useDispatch()
  
  useEffect(() => {
    const onlineUsersCallback = (response) => {
      const {onlineUserIds} = response;
      dispatch(onlineUsers({onlineUsers:Object.keys(onlineUserIds), type: "online"}))
    }
      const offlineUsersCallback = (response) => {
        const {onlineUserIds} = response;
        dispatch(onlineUsers({type:"offline", onlineUsers: Object.keys(onlineUserIds)}))
      }
    if(accessToken){
      socket.auth = {token: accessToken};
      socket.connect()
      socket.on("offlineUsers", offlineUsersCallback)
      socket.on("onlineUsers", onlineUsersCallback)
    } else{
      socket.disconnect()
    }

    return () => {
      socket.off("onlineUsers", onlineUsersCallback)
      socket.off("offlineUsers", offlineUsersCallback)
      socket.disconnect()
    }
  }, [accessToken])
  return (
    <div>
      <Suspense fallback={<div>Loading.....</div>}>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/profile' element={<ProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
