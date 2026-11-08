import React from 'react'
import { Avatar, Badge, IconButton } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import { conversations, messagesByConversation, currentUser, onlineUserIds } from '../../data/mockChat'
import { colorFor, conversationTitle, formatTime, fullName, initialsOf, isMine, isReadByOthers, otherUser } from '../../utils/chatHelpers'
const headerBtn = { bgcolor: '#f1f2fb', color: '#1e1b4b', width: 44, height: 44 }

const Time = ({ m, mine }) => (
  <span className="text-[11px] text-slate-500 flex items-center gap-0.5 self-end whitespace-nowrap">
    {formatTime(m.createdAt)}{mine && isReadByOthers(m) && <DoneAllRoundedIcon sx={{ fontSize: 15 }} className="text-indigo-600" />}
  </span>
)

const Bubble = ({ m }) => {
  const mine = isMine(m, currentUser)
  const sender = m.senderId
  const name = fullName(sender)
  return (
    <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && <Avatar sx={{ bgcolor: colorFor(sender._id), width: 36, height: 36, fontSize: 14 }}>{initialsOf(name)}</Avatar>}
      {m.messageType === 'image' ? (
        <div className="relative max-w-[75%] sm:max-w-sm rounded-2xl overflow-hidden shadow-sm">
          <img src={m.attachments[0]} alt="" className="w-full h-auto object-cover" />
          <span className="absolute bottom-2 right-2 text-[11px] text-white bg-black/40 rounded-full px-2 py-0.5">{formatTime(m.createdAt)}</span>
        </div>
      ) : (
        <div className={`max-w-[75%] flex gap-3 px-4 py-2.5 rounded-2xl shadow-sm ${mine ? 'bg-indigo-100' : 'bg-white'} text-slate-900`}>
          <span className="break-words">{m.content}</span>
          <Time m={m} mine={mine} />
        </div>
      )}
      {mine && <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36, fontSize: 14 }}>{initialsOf(fullName(currentUser))}</Avatar>}
    </div>
  )
}

const ChatWindow = ({ activeId, onBack, className = '' }) => {
  const conv = conversations.find((c) => c._id === activeId) ?? conversations[0]
  const messages = messagesByConversation[conv._id] ?? []
  const isGroup = conv.type === 'group'
  const other = isGroup ? null : otherUser(conv, currentUser)
  const title = conversationTitle(conv, currentUser)
  const online = !isGroup && onlineUserIds.includes(other._id)
  return (
    <section className={`flex-1 min-w-0 min-h-0 flex-col bg-[#f7f7fd] ${className}`}>
      <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-slate-100">
        <IconButton onClick={onBack} className="md:!hidden" aria-label="back"><ArrowBackIcon /></IconButton>
        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!online}
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#22c55e', color: '#22c55e', border: '2px solid #fff' } }}>
          <Avatar sx={{ bgcolor: isGroup ? '#e0e7ff' : colorFor(other._id), width: 48, height: 48 }}>{initialsOf(title)}</Avatar>
        </Badge>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-slate-900 truncate">{title}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            {isGroup ? `${conv.participants.length} members` : <><span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-slate-300'}`} />{online ? 'Online' : 'Offline'}</>}
          </p>
        </div>
        <IconButton sx={headerBtn}><PhoneOutlinedIcon /></IconButton>
        <IconButton sx={headerBtn}><VideocamOutlinedIcon /></IconButton>
        <IconButton sx={headerBtn}><MoreHorizIcon /></IconButton>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 flex flex-col gap-4">
        <div className="self-center bg-white rounded-full px-4 py-1 text-sm font-medium shadow-sm">Today</div>
        {messages.map((m) => <Bubble key={m._id} m={m} />)}
      </div>

      <footer className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <form className="flex items-center gap-2 sm:gap-3" onSubmit={(e) => e.preventDefault()}>
          <IconButton aria-label="emoji"><SentimentSatisfiedAltOutlinedIcon /></IconButton>
          <div className="flex-1 flex items-center gap-1 border border-slate-200 rounded-full pl-5 pr-2 py-1">
            <input placeholder="Type a message..." className="flex-1 min-w-0 bg-transparent outline-none py-2 text-sm" />
            <IconButton size="small"><AttachFileIcon className="text-slate-500" /></IconButton>
            <IconButton size="small"><ImageOutlinedIcon className="text-slate-500" /></IconButton>
          </div>
          <IconButton type="submit" aria-label="send" sx={{ bgcolor: '#4f46e5', color: '#fff', width: 48, height: 48, '&:hover': { bgcolor: '#4338ca' } }}>
            <SendRoundedIcon />
          </IconButton>
        </form>
      </footer>
    </section>
  )
}

export default ChatWindow
