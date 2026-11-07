import React from 'react'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import logo from '../assets/logo.svg'
import illustration from '../assets/auth_illustration.svg'

const Avatar = ({ className = '', size = 'w-14 h-14' }) => (
  <div className={`absolute ${size} rounded-full bg-indigo-300/60 flex items-center justify-center ${className}`}>
    <PersonRoundedIcon className="text-white" />
  </div>
)

const AuthLayout = ({ tagline, children }) => (
  <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-100">
    <div className="w-full max-w-md md:max-w-4xl md:min-h-[640px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      {/* Brand panel */}
      <div className="relative md:w-5/12 bg-gradient-to-r md:bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-600 text-white flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 text-center px-5 py-4 md:px-8 md:py-10 overflow-hidden">
        <img src={logo} alt="ChatApp" className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-lg" />
        <div className="text-left md:text-center">
          <h1 className="md:mt-3 text-2xl md:text-4xl font-bold leading-tight">ChatApp</h1>
          <p className="md:mt-2 text-xs md:text-sm text-indigo-100">Connect. Chat. Share.</p>
        </div>
        <p className="hidden md:block mt-8 text-base text-indigo-50 max-w-[200px]">{tagline}</p>

        <div className="relative mt-auto w-full hidden md:block">
          <img src={illustration} alt="" className="w-full" />
          <Avatar className="left-0 top-4" />
          <Avatar className="right-2 top-14" size="w-12 h-12" />
          <Avatar className="right-12 bottom-8" size="w-9 h-9" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 md:px-12 lg:px-14 py-8 md:py-10">{children}</div>
    </div>
  </div>
)

export default AuthLayout
