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
import {useSelector} from "react-redux"
import { loginAccessToken } from './redux/selectors/auth.selector'

const App = () => {
  const accessToken = useSelector(loginAccessToken)
  const socket =  io(import.meta.env.VITE_BACKEND_URL, {
    auth: {
      token: accessToken
    }
  })
  useEffect(() => {
    socket.on("connect", () => {})
    socket.on(`notify:}`, () => {
      console.log("Notification received")
    })
  }, [])
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
