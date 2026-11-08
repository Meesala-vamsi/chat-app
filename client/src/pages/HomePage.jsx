import React, { useState } from 'react'
import Sidebar from '../components/chat/Sidebar'
import ChatList from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'
import { conversations } from '../data/mockChat'
import {useDispatch} from "react-redux"
import { logoutService } from '../redux/slices/authSlice'
import {toast} from "react-toastify"

const HomePage = () => {
  const [activeId, setActiveId] = useState(conversations[0]._id)
  // Below md only one pane is visible at a time: the list, or the open chat.
  const [showChat, setShowChat] = useState(false)
  const dispatch = useDispatch()
  const onClickLogout = () => {
    console.log("Clicked Logout")
    dispatch(logoutService())
    .then((response) => {
      console.log("🚀 ~ onClickLogout ~ response:", response.ok)
      toast.success(response.payload?.data?.message || "Logout successfully")
    })
    .catch((error) => {
      toast.error(error)
    })
  }

  return (
    <div className="h-dvh w-full p-0 sm:p-4 bg-indigo-50">
      <div className="h-full flex flex-col md:flex-row bg-white sm:rounded-3xl overflow-hidden shadow-xl">
        <Sidebar onLogout={onClickLogout} />
        <ChatList
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowChat(true) }}
          className={showChat ? 'hidden md:flex' : 'flex'}
        />
        <ChatWindow
          activeId={activeId}
          onBack={() => setShowChat(false)}
          className={showChat ? 'flex' : 'hidden md:flex'}
        />
      </div>
    </div>
  )
}

export default HomePage
