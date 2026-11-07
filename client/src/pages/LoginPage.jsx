import React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Checkbox, FormControlLabel } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AuthLayout from '../components/AuthLayout'
import AuthField from '../components/AuthField'
import SocialButtons, { OrDivider, primaryBtnSx } from '../components/SocialButtons'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginService } from '../redux/slices/authSlice'
import { authStatus } from '../redux/selectors/auth.selector'
import { toast } from 'react-toastify'

const LoginPage = () => {

  const [credentials, setCredentials] = useState({
    email:"",
    password: ""
  })
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(authStatus)
  const navigate = useNavigate()

  // already logged in -> go straight to home
  if (isAuthenticated) return <Navigate to="/" replace />

  const onChangeCredentails = (event) => {

    setCredentials((credentials) => ({
      ...credentials,
      [event.target.type] : event.target.value
    }))
  }

  const onSubmitCredentials = async (event) => {
    event.preventDefault();
    try {
      // unwrap() throws when the thunk is rejected, so errors reach the catch block
      const response = await dispatch(loginService(credentials)).unwrap()
      toast.success(response.message)
      setCredentials({ email: "", password: "" })
      navigate("/", { replace: true })
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to login")
    }
  }

  return (
    <AuthLayout tagline="Stay connected with your friends and team anywhere, anytime.">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900">Welcome Back!</h2>
      <p className="mt-2 mb-8 text-center text-indigo-900/70">Sign in to your account</p>

      <form className="flex flex-col gap-4" onSubmit={onSubmitCredentials}>
        <AuthField icon={<EmailOutlinedIcon />} type="email" placeholder="Email Address" value={credentials.email} onChange={(event) => onChangeCredentails(event)} />
        <AuthField icon={<LockOutlinedIcon />} type="password" placeholder="Password" value={credentials.password} onChange={(event) => onChangeCredentails(event)} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
          <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
          <Link to="#" className="text-indigo-600 font-medium">Forgot password?</Link>
        </div>

        <Button type="submit" fullWidth variant="contained" endIcon={<ArrowForwardIcon />} sx={primaryBtnSx}>
          Login
        </Button>
      </form>

      <OrDivider />
      <SocialButtons />

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-indigo-600 font-semibold">Sign up</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
