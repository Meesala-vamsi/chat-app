import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/chat/Sidebar'
import ChatList from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'
import { useDispatch } from "react-redux"
import { logout, logoutService } from '../redux/slices/authSlice'
import { toast } from "react-toastify"
import { socket } from '../utils/socket'
import { createConversation } from '../redux/slices/conversationSlice'
import { fetchMessages } from '../redux/slices/messageSlice'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const [activeId, setActiveId] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const navigate = useNavigate()
  // who is typing, per conversation: { [conversationId]: user }
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimersRef = useRef({});
  const dispatch = useDispatch()

  const onClickLogout = () => {
    console.log("Clicked Logout")
    dispatch(logoutService())
      .then((response) => {
        console.log("🚀 ~ onClickLogout ~ response:", response.ok)
        toast.success(response.payload?.data?.message || "Logout successfully")
        dispatch(logout())
        navigate("/login")
      })
      .catch((error) => {
        toast.error(error)
      })
  }
  

  // open a conversation: leave the previous socket room, join the new one, then load its messages
  const onClickConversation = async (conversationId) => {
    setShowChat(true)
    if (conversationId === activeId) return

    if (activeId) {
      socket.emit("leaveConversation", activeId)
    }
    socket.emit("joinConversation", conversationId, (response) => {
      if (!response.status) toast.error(response.message)
    })

    setActiveId(conversationId)
    await dispatch(fetchMessages({ conversationId })).unwrap()
  }

  // a user picked from the search results: create (or reuse) the conversation, then open it
  const onSelectUser = async (user) => {
    try {
      const response = await dispatch(createConversation({ selectedUserId: user._id, type: "direct" })).unwrap()
      await onClickConversation(response.data.conversation._id)
    } catch (error) {
      toast.error(error?.message || "Failed to open conversation")
    }
  }

  useEffect(() => {
    const clearTypingUser = (conversationId) => {
      clearTimeout(typingTimersRef.current[conversationId])
      setTypingUsers((previous) => {
        const updated = { ...previous }
        delete updated[conversationId]
        return updated
      })
    }

    const handleTyping = ({ conversationId, user }) => {
      setTypingUsers((previous) => ({ ...previous, [conversationId]: user }))

      // safety net: hide it after 4s if no "stop typing" event arrives (e.g. their connection dropped)
      clearTimeout(typingTimersRef.current[conversationId])
      typingTimersRef.current[conversationId] = setTimeout(() => clearTypingUser(conversationId), 4000)
    }

    const handleStopTyping = ({ conversationId }) => clearTypingUser(conversationId)

    // a new message from them means they are no longer typing
    const handleNewMessage = (message) => clearTypingUser(message.conversationId)

    socket.on("typing", handleTyping)
    socket.on("stopTyping", handleStopTyping)
    socket.on("newMessage", handleNewMessage)

    return () => {
      socket.off("typing", handleTyping)
      socket.off("stopTyping", handleStopTyping)
      socket.off("newMessage", handleNewMessage)
      Object.values(typingTimersRef.current).forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="h-dvh w-full bg-white">
      <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
        <Sidebar onLogout={onClickLogout} />
        <ChatList
          activeId={activeId}
          onSelect={(id) => onClickConversation(id)}
          className={showChat ? 'hidden md:flex' : 'flex'}
          onSelectUser={onSelectUser}
        />
        <ChatWindow
          activeId={activeId}
          onBack={() => setShowChat(false)}
          className={showChat ? 'flex' : 'hidden md:flex'}
          typingUser={typingUsers[activeId] ?? null}
        />
      </div>
    </div>
  )
}

export default HomePage
