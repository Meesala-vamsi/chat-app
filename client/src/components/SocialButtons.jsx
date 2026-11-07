import React from 'react'
import { Button } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'

const btn = {
  borderRadius: '14px', textTransform: 'none', py: 1.2, color: '#111827',
  borderColor: '#e5e7f5', fontWeight: 500,
  '&:hover': { borderColor: '#4f46e5', backgroundColor: '#f8f9ff' },
}

const SocialButtons = ({ onGoogle, onGithub }) => (
  <div className="flex flex-col gap-3">
    <Button fullWidth variant="outlined" sx={btn} onClick={onGoogle}
      startIcon={<GoogleIcon sx={{ color: '#ea4335' }} />}>Continue with Google</Button>
    <Button fullWidth variant="outlined" sx={btn} onClick={onGithub}
      startIcon={<GitHubIcon />}>Continue with GitHub</Button>
  </div>
)

export const OrDivider = () => (
  <div className="flex items-center gap-3 my-5 text-xs text-gray-400">
    <div className="flex-1 h-px bg-gray-200" />or<div className="flex-1 h-px bg-gray-200" />
  </div>
)

export const primaryBtnSx = {
  borderRadius: '14px', textTransform: 'none', py: 1.4, fontSize: 16, fontWeight: 600,
  background: 'linear-gradient(90deg,#4f46e5,#6d5cf5)', boxShadow: '0 8px 20px rgba(79,70,229,.3)',
}

export default SocialButtons
