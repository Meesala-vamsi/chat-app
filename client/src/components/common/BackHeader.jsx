import { IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { squareButtonSx } from './buttonStyles'

const BackHeader = ({ title, onBack, children }) => (
  <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-100">
    <div className="flex items-center gap-4 min-w-0">
      <IconButton onClick={onBack} aria-label="back" sx={squareButtonSx}><ArrowBackIcon sx={{ fontSize: 20 }} /></IconButton>
      <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
    </div>
    {children}
  </header>
)

export default BackHeader
