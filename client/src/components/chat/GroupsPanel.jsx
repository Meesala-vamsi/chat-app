import React from 'react'
import { Button, IconButton } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import CodeRoundedIcon from '@mui/icons-material/CodeRounded'
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded'
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded'
import { useSelector } from 'react-redux'
import { getConversations } from '../../redux/selectors/conversation.selector'
import { formatListTime } from '../../utils/chatHelpers'

// Placeholder rows shown until the user is in a real group, so the layout is always visible.
const sampleGroups = [
  { _id: 'sample-1', groupName: 'Developers Crew', members: 12, status: 'Active now', preview: "Let's discuss new technologies! 🚀" },
  { _id: 'sample-2', groupName: 'Study Group', members: 8, status: 'Yesterday', preview: 'Next class on Sunday?' },
]

// Static for now: the server has no "public groups" API yet.
const discoverGroups = [
  { id: 'tech', name: 'Tech Enthusiasts', members: '5.2K', icon: CodeRoundedIcon },
  { id: 'ai', name: 'AI & ML Learners', members: '3.8K', icon: PsychologyRoundedIcon },
  { id: 'web', name: 'Web Developers', members: '4.1K', icon: LaptopMacRoundedIcon },
]

// round avatar colours, in the order of the design: indigo, then teal
const avatarStyles = [
  { bg: '#e0e7ff', fg: '#4f46e5' },
  { bg: '#ccfbf1', fg: '#14b8a6' },
  { bg: '#fce7f3', fg: '#ec4899' },
  { bg: '#fef3c7', fg: '#f59e0b' },
]

const outlineButtonSx = {
  textTransform: 'none', fontWeight: 600, fontSize: 13, borderRadius: '10px', color: '#4f46e5',
  borderColor: '#c7d2fe', bgcolor: '#fff', '&:hover': { borderColor: '#818cf8', bgcolor: '#eef2ff' },
}

const ViewAll = () => (
  <button className="text-sm text-indigo-600 font-medium flex items-center gap-1 shrink-0">
    View all <ArrowForwardIcon sx={{ fontSize: 16 }} />
  </button>
)

// onOpenGroup(conversationId) opens that group in the Chats tab; onCreateGroup is called by the header button.
const GroupsPanel = ({ onOpenGroup, onCreateGroup, className = '' }) => {
  const conversations = useSelector(getConversations)

  const realGroups = conversations
    .filter((conversation) => conversation.type === 'group')
    .map((group) => ({
      _id: group._id,
      groupName: group.groupName,
      members: group.participants.length,
      status: group.lastMessage?.createdAt ? formatListTime(group.lastMessage.createdAt) : '',
      preview: group.lastMessage ? (group.lastMessage.messageType === 'text' ? group.lastMessage.content : `📎 ${group.lastMessage.messageType}`) : 'No messages yet',
    }))
  const groups = realGroups.length > 0 ? realGroups : sampleGroups

  return (
    <section className={`flex-1 min-w-0 min-h-0 flex-col bg-white ${className}`}>
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Groups</h1>
          <p className="text-sm text-slate-500 truncate">Join or manage your groups</p>
        </div>
        <Button variant="contained" onClick={onCreateGroup} startIcon={<AddRoundedIcon />}
          sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 600, fontSize: 15, borderRadius: '12px', px: 2.5, py: 1.1, boxShadow: '0 4px 12px rgba(79,70,229,0.3)', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#4338ca', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' } }}>
          Create Group
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-7 bg-[#fafaff]">
        {/* your groups */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Your Groups ({groups.length})</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {groups.map((group, index) => {
              const style = avatarStyles[index % avatarStyles.length]
              return (
                <div key={group._id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg, color: style.fg }}>
                    <GroupsRoundedIcon sx={{ fontSize: 34 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{group.groupName}</p>
                    <p className="text-xs text-slate-500">{group.members} members{group.status && ` • ${group.status}`}</p>
                    <p className="text-sm text-slate-600 truncate mt-0.5">{group.preview}</p>
                  </div>
                  <Button variant="outlined" size="small" onClick={() => onOpenGroup?.(group._id)}
                    disabled={group._id.startsWith('sample-')} sx={{ ...outlineButtonSx, px: 2, py: 0.8, whiteSpace: 'nowrap' }}>
                    Open Chat
                  </Button>
                  <IconButton size="small" aria-label="group options" sx={{ color: '#475569' }}><MoreVertRoundedIcon /></IconButton>
                </div>
              )
            })}
          </div>
        </div>

        {/* discover */}
        <div>
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">Discover Groups</h2>
              <p className="text-sm text-slate-500">Explore and join interesting groups</p>
            </div>
            <ViewAll />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {discoverGroups.map(({ id, name, members, icon: Icon }) => (
              <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Icon /></div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{name}</p>
                    <p className="text-xs text-slate-500">{members} members</p>
                  </div>
                </div>
                <Button variant="outlined" size="small" sx={{ ...outlineButtonSx, alignSelf: 'center', px: 4, borderRadius: '999px', bgcolor: '#f5f3ff' }}>
                  Join
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default GroupsPanel
