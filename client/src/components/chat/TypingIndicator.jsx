import React, { useRef } from 'react'
import { Avatar } from '@mui/material'
import { colorFor, initialsOf } from '../../utils/chatHelpers'

// UI only: pass the user who is typing, or null when nobody is.
// The block slides open / closed (height + fade) instead of popping in and out.
const TypingIndicator = ({ user }) => {
  // remember the last typer so the block can still show them while it animates closed
  const lastUserRef = useRef(null)
  if (user) lastUserRef.current = user

  const shownUser = user ?? lastUserRef.current
  if (!shownUser) return null

  const isOpen = Boolean(user)
  const displayName = [shownUser.firstName, shownUser.lastName].filter(Boolean).join(' ') || shownUser.username || shownUser.email

  return (
    <div
      role="status"
      aria-hidden={!isOpen}
      // grid-rows 0fr -> 1fr animates the height; the negative top margin cancels the list's gap while closed
      className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-0' : 'grid-rows-[0fr] opacity-0 -mt-4'}`}
    >
      <div className="overflow-hidden">
        <div className={`flex items-end gap-2 transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-2'}`}>
          <Avatar sx={{ bgcolor: colorFor(shownUser._id), width: 36, height: 36, fontSize: 14 }}>{initialsOf(displayName)}</Avatar>

          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-slate-500 mb-1 px-1">{displayName} is typing...</span>
            <div className="flex items-center gap-1.5 h-9 px-4 rounded-2xl rounded-bl-md bg-white shadow-sm border border-slate-100">
              {[0, 160, 320].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-indigo-500"
                  style={{ animation: 'typing-wave 1.2s ease-in-out infinite', animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
