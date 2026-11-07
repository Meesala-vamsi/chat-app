import React, { useState } from 'react'
import { InputAdornment, IconButton, TextField } from '@mui/material'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

const AuthField = ({ icon, type = 'text', ...props }) => {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <TextField
      fullWidth
      variant="outlined"
      type={isPassword && show ? 'text' : type}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label="toggle password visibility">
                {show ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': { borderRadius: '14px', backgroundColor: '#f8f9ff' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7f5' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
      }}
      {...props}
    />
  )
}

export default AuthField
