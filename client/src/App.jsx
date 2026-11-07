import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const SignupPage = lazy(() => import("./pages/SignupPage"))
const HomePage = lazy(() => import("./pages/HomePage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
const PublicRoute = lazy(() => import("./components/PublicRoute"))
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
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
