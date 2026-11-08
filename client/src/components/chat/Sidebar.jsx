import React from 'react'
import { Avatar, Badge } from '@mui/material'
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import logo from '../../assets/logo.svg'
import { currentUser } from '../../data/mockChat'
import { fullName, initialsOf } from '../../utils/chatHelpers'

const items = [
  { label: 'Chats', icon: ChatBubbleRoundedIcon, count: 3 },
  { label: 'Groups', icon: GroupsRoundedIcon, count: 1 },
  { label: 'Contacts', icon: PersonRoundedIcon },
  { label: 'Settings', icon: SettingsRoundedIcon },
]

// One element, three layouts:
//  < md  : bottom tab bar (icons + small labels)
//  md    : slim icon-only rail on the left
//  lg+   : full sidebar with profile, labels and footer
const Sidebar = ({ active = 'Chats', onSelect, onLogout, className = '' }) => (
  <aside className={`order-last md:order-none shrink-0 bg-[#1e1b4b] text-white flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start px-2 py-1.5 md:p-3 lg:p-4 md:w-20 lg:w-60 ${className}`}>
    {/* logo */}
    <div className="hidden md:flex items-center justify-center lg:justify-start gap-2 mb-6 lg:mb-8">
      <img src={logo} alt="ChatApp" className="w-9 h-9 rounded-xl" />
      <span className="hidden lg:inline text-xl font-bold">ChatApp</span>
    </div>

    {/* profile */}
    <div className="hidden md:flex items-center justify-center lg:justify-start gap-3 mb-6 lg:mb-8">
      <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot"
        sx={{ '& .MuiBadge-badge': { backgroundColor: '#22c55e', color: '#22c55e' } }}>
        <Avatar sx={{ bgcolor: '#6366f1', width: { md: 40, lg: 52 }, height: { md: 40, lg: 52 }, fontWeight: 600 }}>{initialsOf(fullName(currentUser))}</Avatar>
      </Badge>
      <div className="hidden lg:block min-w-0">
        <p className="font-semibold leading-tight truncate">{fullName(currentUser)}</p>
        <p className="text-xs text-indigo-200 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Online</p>
      </div>
    </div>

    <nav className="flex flex-row md:flex-col gap-1 flex-1 md:flex-none justify-around md:justify-start">
      {items.map(({ label, icon: Icon, count }) => {
        const on = active === label
        return (
          <button key={label} onClick={() => onSelect?.(label)} title={label} aria-label={label}
            className={`relative flex flex-col md:flex-row items-center justify-center lg:justify-start gap-0.5 md:gap-3 px-3 py-1.5 md:py-3 lg:px-4 rounded-xl transition ${on ? 'bg-indigo-600' : 'hover:bg-white/10 text-indigo-100'}`}>
            <Icon fontSize="small" />
            <span className="text-[10px] md:hidden lg:inline lg:text-base lg:flex-1 lg:text-left">{label}</span>
            {count && (
              <span className={`absolute top-0.5 right-1 md:top-1 md:right-1 lg:static text-[10px] lg:text-xs min-w-5 h-5 lg:w-6 lg:h-6 px-1 rounded-full flex items-center justify-center ${on ? 'bg-white text-indigo-700' : 'bg-indigo-500 lg:bg-white/20'}`}>{count}</span>
            )}
          </button>
        )
      })}
    </nav>

    <button onClick={onLogout} title="Logout" aria-label="Logout"
      className="md:mt-auto flex flex-col md:flex-row items-center justify-center lg:justify-start gap-0.5 md:gap-3 px-3 py-1.5 md:py-3 lg:px-4 rounded-xl md:border border-white/15 hover:bg-white/10 text-indigo-100">
      <LogoutRoundedIcon fontSize="small" />
      <span className="text-[10px] md:hidden lg:inline lg:text-base">Logout</span>
    </button>

    <p className="hidden lg:block mt-6 text-center text-xs text-indigo-200">Stay connected<br />with your friends!</p>
  </aside>
)

export default Sidebar
