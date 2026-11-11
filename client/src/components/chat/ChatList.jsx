import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import debounce from 'lodash.debounce'
import UserSearchResults from './UserSearchResults'
import { clearUsers, searchUsers } from '../../redux/slices/userSlice'
// import { onlineUserIds } from '../../data/mockChat'
import { colorFor, conversationTitle, formatListTime, hasUnreadLast, initialsOf, lastMessagePreview, otherUser } from '../../utils/chatHelpers'
import { useDispatch, useSelector } from 'react-redux'
import { fetchConversations } from '../../redux/slices/conversationSlice'
import { getUserDetails } from '../../redux/selectors/auth.selector'
import { getConversations } from '../../redux/selectors/conversation.selector'
import { getOnlineUsers } from '../../redux/selectors/user.selector'


const Section = ({ title }) => (
  <div className="flex items-center justify-between px-5 mt-4 mb-2">
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <button className="text-sm text-indigo-600 font-medium flex items-center gap-1">View all <ArrowForwardIcon sx={{ fontSize: 16 }} /></button>
  </div>
)

const Unread = ({ n }) => n > 0 && (
  <span className="min-w-6 h-6 px-1.5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">{n}</span>
)

const Row = ({ selected, onClick, avatar, name, last, time, unread }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition ${selected ? 'bg-indigo-100' : 'hover:bg-slate-50'}`}>
    {avatar}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between gap-2">
        <span className="font-semibold text-slate-900 truncate">{name}</span>
        <span className="text-xs text-slate-500 shrink-0">{time}</span>
      </div>
      <div className="flex justify-between gap-2 items-center">
        <span className="text-sm text-slate-500 truncate">{last}</span>
        <Unread n={unread} />
      </div>
    </div>
  </button>
)

const ChatList = ({ activeId, onSelect, onSelectUser, className = '' }) => {
  const conversations = useSelector(getConversations);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('')
  const searchTerm = search.trim()
  const directConversations = conversations.filter((conversation) => conversation.type === 'direct')
  const groupConversations = conversations.filter((conversation) => conversation.type === 'group')
  const currentUser = useSelector(getUserDetails);
  const onlineUserIds = useSelector(getOnlineUsers)
  console.log("🚀 ~ ChatList ~ onlineUserIds:", onlineUserIds)
  console.log("🚀 ~ ChatList ~ currentUser:", currentUser)

  // lodash debounce: the API is called 400ms after the user stops typing
  const searchUsersDebounced = useMemo(
    () => debounce((term) => dispatch(searchUsers({ search: term, page: 1 })), 400),
    [dispatch]
  )

  useEffect(() => {
    if (searchTerm) {
      searchUsersDebounced(searchTerm)
    } else {
      searchUsersDebounced.cancel()
      dispatch(clearUsers())
    }
    return () => searchUsersDebounced.cancel()
  }, [searchTerm, searchUsersDebounced, dispatch])

  // after picking a searched user: tell the parent, clear the search box and show all conversations again
  const handleSelectUser = (user) => {
    onSelectUser?.(user)
    setSearch('')
  }

  useEffect(() =>{
    dispatch(fetchConversations())
    .then((response) => {
      console.log("🚀 ~ ChatList ~ response:", response)
      
    })
  }, [])

  return (
    <section className={`w-full flex-1 md:flex-none md:w-80 lg:w-96 shrink-0 min-h-0 flex-col bg-white border-r border-slate-100 ${className}`}>
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
          <SearchRoundedIcon className="text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users or groups..." className="flex-1 bg-transparent outline-none text-sm" />
          <TuneRoundedIcon className="text-slate-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {searchTerm ? <UserSearchResults search={searchTerm} onSelectUser={handleSelectUser} /> : (<>
      <Section title="Chats" />
        <div className="px-2">
          {directConversations.map((c) => {
            const other = otherUser(c, currentUser)
            const name = conversationTitle(c, currentUser)
            return (
              <Row key={c._id} selected={activeId === c._id} onClick={() => onSelect(c._id)} name={name}
                last={lastMessagePreview(c, currentUser)} time={formatListTime(c.lastMessageAt)}
                unread={hasUnreadLast(c, currentUser) ? 1 : 0}
                avatar={
                  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!onlineUserIds.includes(other?._id)}
                    sx={{ '& .MuiBadge-badge': { backgroundColor: '#22c55e', color: '#22c55e', border: '2px solid #fff' } }}>
                    <Avatar sx={{ bgcolor: colorFor(other?._id), width: 52, height: 52 }}>{initialsOf(name)}</Avatar>
                  </Badge>} />
            )
          })}
        </div>

        <Section title="Groups" />
        <div className="px-2">
          {groupConversations.map((g) => (
            <Row key={g._id} selected={activeId === g._id} onClick={() => onSelect(g._id)} name={conversationTitle(g, currentUser)}
              last={lastMessagePreview(g, currentUser)} time={formatListTime(g.lastMessageAt)} unread={hasUnreadLast(g, currentUser) ? 1 : 0}
              avatar={<Avatar src={g.groupImage || undefined} sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', width: 52, height: 52 }}><GroupsRoundedIcon /></Avatar>} />
          ))}
        </div>
        </>)}
      </div>
    </section>
  )
}

export default ChatList
