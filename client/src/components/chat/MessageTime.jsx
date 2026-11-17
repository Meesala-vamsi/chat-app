import React from 'react'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import { formatTime, isReadByOthers } from '../../utils/chatHelpers'

// Time of a message, plus the blue tick when the other person has read it.
// overlay: white text on a dark pill, used on top of images and videos.
const MessageTime = ({ m, mine, overlay = false }) => (
  <span className={overlay
    ? 'text-[10px] text-white bg-black/45 rounded-full px-2 py-0.5 flex items-center gap-0.5 whitespace-nowrap'
    : 'text-[10px] text-slate-500 flex items-center gap-0.5 self-end whitespace-nowrap'}>
    {formatTime(m.createdAt)}
    {mine && isReadByOthers(m) && <DoneAllRoundedIcon sx={{ fontSize: 13 }} className={overlay ? 'text-sky-300' : 'text-indigo-600'} />}
  </span>
)

export default MessageTime
