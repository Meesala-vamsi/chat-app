import React, { useEffect, useMemo, useRef, useState } from 'react'
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
// import { onlineUserIds } from '../../data/mockChat'
import { colorFor, conversationTitle, formatDayLabel, formatTime, fullName, initialsOf, isMine, isReadByOthers, otherUser } from '../../utils/chatHelpers'
import { useDispatch, useSelector } from 'react-redux'
import { getConversations } from '../../redux/selectors/conversation.selector'
import { getMessages } from '../../redux/selectors/message.selector'
import { getUserDetails } from '../../redux/selectors/auth.selector'
import throttle from 'lodash.throttle'
import TypingIndicator from './TypingIndicator'
import { socket } from '../../utils/socket'
import { addMessage, handleReadStatus, sendMessage } from '../../redux/slices/messageSlice'
import { toast } from 'react-toastify'
import { fetchConversations } from '../../redux/slices/conversationSlice'
import { getOnlineUsers } from '../../redux/selectors/user.selector'
const headerBtn = { color: '#64748b', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }

const Time = ({ m, mine }) => (
  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 self-end whitespace-nowrap">
    {formatTime(m.createdAt)}{mine && isReadByOthers(m) && <DoneAllRoundedIcon sx={{ fontSize: 13 }} className="text-indigo-600" />}
  </span>
)

const Bubble = ({ m }) => {
  const currentUser = useSelector(getUserDetails)
  const mine = isMine(m, currentUser)
  const sender = m.senderId
  const name = fullName(sender)
  return (
    <div className={`animate-message-appear flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && <Avatar sx={{ bgcolor: colorFor(sender._id), width: 30, height: 30, fontSize: 12 }}>{initialsOf(name)}</Avatar>}
      <div className={`flex flex-col max-w-[75%] sm:max-w-sm ${mine ? 'items-end' : 'items-start'}`}>
        {/* who sent it: "You" for the current user, first name for everyone else */}
        <span className="text-[11px] font-medium text-slate-400 mb-0.5 px-2">{mine ? 'You' : sender.firstName}</span>
        {m.messageType === 'image' ? (
          <div className={`relative rounded-2xl overflow-hidden shadow-sm ${mine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
            <img src={m.attachments[0]} alt="" className="w-full h-auto object-cover" />
            <span className="absolute bottom-2 right-2 text-[11px] text-white bg-black/40 rounded-full px-2 py-0.5">{formatTime(m.createdAt)}</span>
          </div>
        ) : (
          <div className={`flex gap-2 px-3.5 py-1.5 rounded-2xl shadow-sm ${mine ? 'bg-indigo-100 rounded-br-sm' : 'bg-white rounded-bl-sm'} text-slate-900`}>
            <span className="break-words text-[13px] leading-snug">{m.content}</span>
            <Time m={m} mine={mine} />
          </div>
        )}
      </div>
      {mine && <Avatar sx={{ bgcolor: '#6366f1', width: 30, height: 30, fontSize: 12 }}>{initialsOf(fullName(currentUser))}</Avatar>}
    </div>
  )
}

// typingUser: the user who is currently typing in this conversation (null when nobody)
const ChatWindow = ({ activeId, onBack, typingUser = null, className = '' }) => {
  const currentUser = useSelector(getUserDetails)
  const conversations = useSelector(getConversations)
  const messages = useSelector(getMessages)
  const dispatch = useDispatch();
  const onlineUserIds = useSelector(getOnlineUsers)
  const conv = conversations.find((conversation) => conversation._id === activeId)

  const [message, setMessage] = useState({
    content: "",
    messageType: ""
  })

  // Typing events: send "typing" at most once every 1.5s while the user types,
  // and "stop typing" once they pause for 2s, clear the box or send the message.
  const stopTypingTimerRef = useRef(null)

  const emitTyping = useMemo(
    () => throttle((conversationId) => socket.emit("onTyping", { conversationId }), 1500, { trailing: false }),
    []
  )

  const emitStopTyping = (conversationId) => {
    clearTimeout(stopTypingTimerRef.current)
    emitTyping.cancel()
    socket.emit("onStopTyping", { conversationId })
  }

  // stop typing when switching conversation or leaving the page
  useEffect(() => {
    return () => {
      clearTimeout(stopTypingTimerRef.current)
      if (activeId) socket.emit("onStopTyping", { conversationId: activeId })
    }
  }, [activeId])

  // scroll only the message list (not the whole page) down to the newest message
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    const scrollToBottom = () => {
      const container = messagesContainerRef.current
      container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }

    scrollToBottom()
    // the typing block grows over 300ms, so scroll once more when it has finished opening
    const timer = setTimeout(scrollToBottom, 320)
    return () => clearTimeout(timer)
  }, [messages.length, activeId, typingUser])

  console.log("🚀 ~ ChatWindow ~ onlineUserIds:", onlineUserIds)
  useEffect(() => {
    // 1. Define the named handler function
    const handleNewMessage = (response) => {
      dispatch(addMessage(response));
      dispatch(fetchConversations())
    };

    const handleReadMessage = (response) => {
      dispatch(handleReadStatus(response))
    }

    // 2. Turn the listener ON
    socket.on("newMessage", handleNewMessage);
    socket.emit("markMessagesAsRead",activeId)
    socket.on("readMessages", handleReadMessage)

    // 3. Turn the listener OFF when the component unmounts
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("markMessagesAsRead", activeId)
      socket.off("readMessages", handleReadMessage)
    };
  }, [dispatch, activeId])

  // nothing selected yet
  if (!conv) {
    return (
      <section className={`flex-1 min-w-0 min-h-0 flex-col items-center justify-center bg-[#f7f7fd] text-slate-500 ${className}`}>
        <p className="text-lg font-medium">Select a conversation to start chatting</p>
      </section>
    )
  }

  const isGroup = conv.type === 'group'
  const other = isGroup ? null : otherUser(conv, currentUser)
  const title = conversationTitle(conv, currentUser)
  const online = !isGroup && onlineUserIds.includes(other?._id)

  // group the messages by day: [{ dayLabel: "Today", messages: [...] }, ...]
  const messagesByDay = messages.reduce((days, message) => {
    const dayLabel = formatDayLabel(message.createdAt)
    const lastDay = days[days.length - 1]
    if (lastDay?.dayLabel === dayLabel) {
      lastDay.messages.push(message)
    } else {
      days.push({ dayLabel, messages: [message] })
    }
    return days
  }, [])

  const onSubmitMessage = async (event) => {
    try {
      event.preventDefault()
      emitStopTyping(activeId)

      const messageSend = await dispatch(sendMessage({
        ...message,
        conversationId: activeId,
      })).unwrap()

      setMessage({
        content: "",
        messageType:""
      })

      await dispatch(fetchConversations()).unwrap()
      console.log(sendMessage, "messageData");

    } catch (error) {
      toast.error(error.message)
    }
  }

  const onEnterMessage = (event) => {
    setMessage((message) => ({
      ...message,
      "content": event.target.value,
      messageType: "text"
    }))

    // empty box means the user stopped typing
    if (!event.target.value) {
      emitStopTyping(activeId)
      return
    }

    emitTyping(activeId)
    clearTimeout(stopTypingTimerRef.current)
    stopTypingTimerRef.current = setTimeout(() => emitStopTyping(activeId), 2000)
  }

  return (
    <section className={`flex-1 min-w-0 min-h-0 flex-col bg-[#f4f3fb] ${className}`}>
      <header className="flex items-center gap-2 sm:gap-3 px-2 sm:px-6 py-2.5 bg-white border-b border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <IconButton onClick={onBack} className="md:!hidden" aria-label="back"><ArrowBackIcon /></IconButton>
        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!online}
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#22c55e', color: '#22c55e', border: '2px solid #fff' } }}>
          <Avatar sx={{ bgcolor: isGroup ? '#e0e7ff' : colorFor(other?._id), width: 44, height: 44 }}>{initialsOf(title)}</Avatar>
        </Badge>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base text-slate-900 truncate">{title}</h2>
          <p key={typingUser ? 'typing' : 'status'} className="animate-fade-in text-xs text-slate-500 flex items-center gap-1">
            {typingUser ? <span className="text-indigo-600 font-medium">typing...</span> : isGroup ? `${conv.participants.length} members` : <><span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-slate-300'}`} />{online ? 'Online' : 'Offline'}</>}
          </p>
        </div>
        <IconButton sx={headerBtn}><PhoneOutlinedIcon /></IconButton>
        <IconButton sx={headerBtn}><VideocamOutlinedIcon /></IconButton>
        <IconButton sx={headerBtn}><MoreHorizIcon /></IconButton>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-8 py-5 flex flex-col gap-4 bg-[radial-gradient(#e6e3f4_1px,transparent_1px)] bg-size-[20px_20px]">
        {messagesByDay.map((day) => (
          // each day is its own block, so its date tag only sticks while that day's messages are on screen
          <div key={day.dayLabel} className="flex flex-col gap-2.5">
            <div className="sticky -top-3 z-10 self-center mb-1 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">{day.dayLabel}</div>
            {day.messages.map((message) => <Bubble key={message._id} m={message} />)}
          </div>
        ))}
        <TypingIndicator user={typingUser} />
      </div>

      <footer className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <form className="flex items-center gap-2 sm:gap-3" onSubmit={onSubmitMessage}>
          <IconButton aria-label="emojmessagei"><SentimentSatisfiedAltOutlinedIcon /></IconButton>
          <div className="flex-1 min-w-0 flex items-center gap-1 bg-slate-100 rounded-full pl-4 sm:pl-5 pr-1 sm:pr-2 py-1 border border-transparent focus-within:border-violet-300 focus-within:bg-white transition-colors">
            <input placeholder="Type a message" className="flex-1 min-w-0 bg-transparent outline-none py-2 text-sm" value={message.content} onChange={(event) => onEnterMessage(event)} />
            <IconButton size="small"><AttachFileIcon className="text-slate-500" /></IconButton>
            <IconButton size="small"><ImageOutlinedIcon className="text-slate-500" /></IconButton>
          </div>
          <IconButton type="submit" aria-label="send" sx={{ bgcolor: '#7c3aed', color: '#fff', width: 44, height: 44, flexShrink: 0, '&:hover': { bgcolor: '#6d28d9' } }}>
            <SendRoundedIcon />
          </IconButton>
        </form>
      </footer>
    </section>
  )
}

export default ChatWindow
