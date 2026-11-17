import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, Badge, CircularProgress, IconButton } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
// import { onlineUserIds } from '../../data/mockChat'
import { colorFor, conversationTitle, formatDayLabel, fullName, initialsOf, isMine, otherUser } from '../../utils/chatHelpers'
import { MAX_FILE_SIZE_MB, MAX_FILES } from '../../utils/mediaHelpers'
import MessageTime from './MessageTime'
import MessageMedia from './MessageMedia'
import FilePickerButton from '../media/FilePickerButton'
import EmojiPickerButton from '../common/EmojiPickerButton'
import FilePreviewTray from '../media/FilePreviewTray'
import { useDispatch, useSelector } from 'react-redux'
import { getConversations } from '../../redux/selectors/conversation.selector'
import { getMessages } from '../../redux/selectors/message.selector'
import { getUserDetails } from '../../redux/selectors/auth.selector'
import throttle from 'lodash.throttle'
import TypingIndicator from './TypingIndicator'
import { socket } from '../../utils/socket'
import { addMessage, handleReadStatus, sendMessage, uploadMedia } from '../../redux/slices/messageSlice'
import { toast } from 'react-toastify'
import { clearUnread, fetchConversations } from '../../redux/slices/conversationSlice'
import { getOnlineUsers } from '../../redux/selectors/user.selector'
const headerBtn = { color: '#64748b', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }

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
        {m.messageType === 'text' ? (
          <div className={`flex gap-2 px-3.5 py-1.5 rounded-2xl shadow-sm ${mine ? 'bg-indigo-100 rounded-br-sm' : 'bg-white rounded-bl-sm'} text-slate-900`}>
            <span className="break-words text-[13px] leading-snug">{m.content}</span>
            <MessageTime m={m} mine={mine} />
          </div>
        ) : (
          <MessageMedia m={m} mine={mine} />
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

  // files picked with the attach / image buttons, waiting to be sent
  // The files remember which conversation they were picked in, so they are
  // not shown (or sent) in another conversation after switching.
  const [pickedFiles, setPickedFiles] = useState({ conversationId: null, files: [] })
  const selectedFiles = pickedFiles.conversationId === activeId ? pickedFiles.files : []
  const [isUploading, setIsUploading] = useState(false)

  const onPickFiles = (newFiles) => {
    const tooBig = newFiles.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (tooBig) return toast.error(`${tooBig.name} is bigger than ${MAX_FILE_SIZE_MB} MB.`)
    if (selectedFiles.length + newFiles.length > MAX_FILES) return toast.error(`You can send up to ${MAX_FILES} files at once.`)
    setPickedFiles({ conversationId: activeId, files: [...selectedFiles, ...newFiles] })
  }

  const onRemoveFile = (index) => {
    setPickedFiles({ conversationId: activeId, files: selectedFiles.filter((_, fileIndex) => fileIndex !== index) })
  }

  // Typing events: send "typing" at most once every 1.5s while the user types,
  // and "stop typing" once they pause for 2s, clear the box or send the message.
  const stopTypingTimerRef = useRef(null)
  const messageInputRef = useRef(null)

  const emitTyping = useMemo(
    () => throttle((conversationId) => socket.emit("onTyping", { conversationId }), 1500, { trailing: false }),
    []
  )

  const emitStopTyping = (conversationId) => {
    clearTimeout(stopTypingTimerRef.current)
    emitTyping.cancel()
    socket.emit("onStopTyping", { conversationId })
  }

  useEffect(() => {
    return () => {
      clearTimeout(stopTypingTimerRef.current)
      if (activeId) socket.emit("onStopTyping", { conversationId: activeId })
    }
  }, [activeId])

  const messagesContainerRef = useRef(null)

  useEffect(() => {
    const scrollToBottom = () => {
      const container = messagesContainerRef.current
      container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }

    scrollToBottom()
    const timer = setTimeout(scrollToBottom, 320)
    return () => clearTimeout(timer)
  }, [messages.length, activeId, typingUser])

  useEffect(() => {
    // 1. Define the named handler function
    const handleNewMessage = (response) => {
      dispatch(addMessage(response));

      const senderId = response.senderId?._id || response.senderId
      const isIncomingInOpenChat = activeId && response.conversationId === activeId && senderId !== currentUser?._id
      if (isIncomingInOpenChat) {
        socket.emit("markMessagesAsRead", activeId, (response) => {
          // the server answers { status: false } when it could not mark them, and then sends no "readMessages" event
          if (!response?.status) console.warn("markMessagesAsRead failed:", response?.message)
          dispatch(fetchConversations())
        })
      } else {
        dispatch(fetchConversations())
      }
    };

    const handleReadMessage = (response) => {
      dispatch(handleReadStatus(response))
    }

    socket.on("newMessage", handleNewMessage)
    socket.on("readMessages", handleReadMessage)

    // mark what is already unread when this conversation is opened
    if (activeId) {
      socket.emit("markMessagesAsRead", activeId)
      dispatch(clearUnread(activeId))
    }

    return () => {
      socket.off("newMessage", handleNewMessage)
      socket.off("readMessages", handleReadMessage)
    };
  }, [dispatch, activeId, currentUser?._id])

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

  // upload the picked files, then send one message per file; the text in the box becomes the caption of the first one
  const sendSelectedFiles = async () => {
    setIsUploading(true)
    try {
      const { data } = await dispatch(uploadMedia(selectedFiles)).unwrap()
      const caption = message.content.trim()

      for (const [index, file] of data.files.entries()) {
        await dispatch(sendMessage({
          conversationId: activeId,
          messageType: file.messageType,
          attachments: [file.url],
          content: index === 0 ? caption : "",
        })).unwrap()
      }

      setPickedFiles({ conversationId: null, files: [] })
      setMessage({ content: "", messageType: "" })
      await dispatch(fetchConversations()).unwrap()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmitMessage = async (event) => {
    try {
      event.preventDefault()
      emitStopTyping(activeId)

      if (selectedFiles.length > 0) {
        return sendSelectedFiles()
      }

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

  const onEnterMessage = (event) => updateMessageText(event.target.value)

  const onPickEmoji = (emoji) => {
    const input = messageInputRef.current
    const start = input.selectionStart ?? message.content.length
    const end = input.selectionEnd ?? start
    updateMessageText(message.content.slice(0, start) + emoji + message.content.slice(end))
    const caret = start + emoji.length
    requestAnimationFrame(() => input.setSelectionRange(caret, caret))
  }

  const updateMessageText = (text) => {
    setMessage((message) => ({
      ...message,
      "content": text,
      messageType: "text"
    }))

    // empty box means the user stopped typing
    if (!text) {
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
        <FilePreviewTray files={selectedFiles} onRemove={onRemoveFile} disabled={isUploading} />
        <form className="flex items-center gap-2 sm:gap-3" onSubmit={onSubmitMessage}>
          <EmojiPickerButton onSelect={onPickEmoji} onClose={() => messageInputRef.current?.focus()} disabled={isUploading} />
          <div className="flex-1 min-w-0 flex items-center gap-1 bg-slate-100 rounded-full pl-4 sm:pl-5 pr-1 sm:pr-2 py-1 border border-transparent focus-within:border-violet-300 focus-within:bg-white transition-colors">
            <input ref={messageInputRef} placeholder={selectedFiles.length > 0 ? "Add a caption" : "Type a message"} className="flex-1 min-w-0 bg-transparent outline-none py-2 text-sm" value={message.content} onChange={(event) => onEnterMessage(event)} />
            <FilePickerButton label="attach file" onPick={onPickFiles} disabled={isUploading}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt">
              <AttachFileIcon className="text-slate-500" />
            </FilePickerButton>
            <FilePickerButton label="attach photo or video" onPick={onPickFiles} disabled={isUploading} accept="image/*,video/*">
              <ImageOutlinedIcon className="text-slate-500" />
            </FilePickerButton>
          </div>
          <IconButton type="submit" aria-label="send" disabled={isUploading} sx={{ bgcolor: '#7c3aed', color: '#fff', width: 44, height: 44, flexShrink: 0, '&:hover': { bgcolor: '#6d28d9' }, '&.Mui-disabled': { bgcolor: '#a78bfa', color: '#fff' } }}>
            {isUploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <SendRoundedIcon />}
          </IconButton>
        </form>
      </footer>
    </section>
  )
}

export default ChatWindow
