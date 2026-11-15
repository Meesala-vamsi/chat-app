import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/chat/Sidebar'
import ChatList from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'
import GroupsPanel from '../components/chat/GroupsPanel'
import CreateGroupDialog from '../components/chat/CreateGroupDialog'
import { useDispatch, useSelector } from "react-redux"
import { getUserDetails } from '../redux/selectors/auth.selector'
import { logout, logoutService } from '../redux/slices/authSlice'
import { toast } from "react-toastify"
import { socket } from '../utils/socket'
import { createConversation, fetchConversations, incrementUnread } from '../redux/slices/conversationSlice'
import { fetchMessages } from '../redux/slices/messageSlice'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const [activeId, setActiveId] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState('Chats')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const navigate = useNavigate()
  // who is typing, per conversation: { [conversationId]: user }
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimersRef = useRef({});
  const dispatch = useDispatch()
  const currentUser = useSelector(getUserDetails)
  const activeIdRef = useRef(null)
  const currentUserIdRef = useRef(null)
  activeIdRef.current = activeId
  currentUserIdRef.current = currentUser?._id

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

  // groupData = { groupName, memberIds }. The group API is not connected yet, so call it here later.
  const onCreateGroup = (groupData) => {
    console.log("create group", groupData)
    toast.info("Group created UI only: connect the create group API here")
  }

  const onOpenGroup = async (conversationId) => {
    setActiveTab('Chats')
    await onClickConversation(conversationId)
  }

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

      clearTimeout(typingTimersRef.current[conversationId])
      typingTimersRef.current[conversationId] = setTimeout(() => clearTypingUser(conversationId), 4000)
    }

    const handleStopTyping = ({ conversationId }) => clearTypingUser(conversationId)

    // a new message from them means they are no longer typing
    const handleNewMessage = (message) => clearTypingUser(message.conversationId)

    const handleUnreadCount = (data) => {
      console.log("🚀 ~ handleUnreadCount ~ data:", data)
      dispatch(incrementUnread({conversationId: data.conversationId, unreadCount: data.updatedCount}))
    }

    const handleNotifyMessage = () => dispatch(fetchConversations())

    socket.on("typing", handleTyping)
    socket.on("stopTyping", handleStopTyping)
    socket.on("newMessage", handleNewMessage)
    socket.on("unreadCount", handleUnreadCount)
    socket.on("notifyMessage", handleNotifyMessage)

    return () => {
      socket.off("typing", handleTyping)
      socket.off("stopTyping", handleStopTyping)
      socket.off("newMessage", handleNewMessage)
      socket.off("unreadCount", handleUnreadCount)
      socket.off("notifyMessage", handleNotifyMessage)
      Object.values(typingTimersRef.current).forEach(clearTimeout)
    }
  }, [dispatch])

  return (
    <div className="h-dvh w-full bg-white">
      <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
        <Sidebar active={activeTab} onSelect={setActiveTab} onLogout={onClickLogout} />
        {activeTab === 'Groups' ? (
          <GroupsPanel className="flex" onOpenGroup={onOpenGroup} onCreateGroup={() => setShowCreateGroup(true)} />
        ) : (
          <>
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
          </>
        )}
      </div>
      <CreateGroupDialog open={showCreateGroup} onClose={() => setShowCreateGroup(false)} onCreate={onCreateGroup} />
    </div>
  )
}

export default HomePage
