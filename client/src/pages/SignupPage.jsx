import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AuthLayout from '../components/AuthLayout'
import AuthField from '../components/AuthField'
import SocialButtons, { OrDivider, primaryBtnSx } from '../components/SocialButtons'
import { useDispatch } from 'react-redux'
import { signupService } from '../redux/slices/authSlice'

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const dispatch = useDispatch();

  const onChangeInput = (event) => {
    const { name, value } = event.target

    if (name === "fullName") {
      const [firstName, ...rest] = value.trim().split(/\s+/)
      setSignupData((prev) => ({ ...prev, firstName, lastName: rest.join(" ") }))
      return
    }

    setSignupData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmitData = (event) => {
    event.preventDefault();

    dispatch(signupService(signupData))
      .then((response) => {
        setSignupData({
          firstName: "",
          lastName: "",
          email: "",
          password: ""
        })
      })



  }

  return (
    <AuthLayout tagline="Join our community and start chatting today!">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900">Create Account</h2>
      <p className="mt-2 mb-6 text-center text-indigo-900/70">Get started with ChatApp</p>

      <form className="flex flex-col gap-4" onSubmit={onSubmitData}>
        <AuthField icon={<PersonOutlineIcon />} placeholder="Full Name" name="fullName" onChange={(event) => onChangeInput(event)} />
        <AuthField icon={<EmailOutlinedIcon />} type="email" name="email" placeholder="Email Address" onChange={(event) => onChangeInput(event)} />
        <AuthField icon={<LockOutlinedIcon />} type="password" name="password" placeholder="Password" onChange={(event) => onChangeInput(event)} />
        {/* <AuthField icon={<LockOutlinedIcon />} type="password" placeholder="Confirm Password" /> */}

        <Button type="submit" fullWidth variant="contained" endIcon={<ArrowForwardIcon />} sx={primaryBtnSx}>
          Create Account
        </Button>
      </form>

      <OrDivider />
      <SocialButtons />

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold">Login</Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
