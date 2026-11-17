import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CircularProgress, IconButton } from '@mui/material'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import UserAvatar from '../common/UserAvatar'
import BackHeader from '../common/BackHeader'
import { squareButtonSx } from '../common/buttonStyles'
import MediaThumbnail from '../media/MediaThumbnail'
import MediaLightbox from '../media/MediaLightbox'
import SharedMediaScreen from './SharedMediaScreen'
import { clearSelectedContact, fetchContactDetails, fetchSharedMedia } from '../../redux/slices/contactSlice'
import {
  getSelectedContact, getSelectedContactError, getSelectedContactLoading,
  getSharedMedia, getSharedMediaHasMore, getSharedMediaLoading,
} from '../../redux/selectors/contact.selector'
import { getOnlineUsers } from '../../redux/selectors/user.selector'
import { formatLastSeen, fullName } from '../../utils/chatHelpers'

const PREVIEW_COUNT = 4

const ContactDetails = ({ userId, onBack, className = '' }) => {
  const dispatch = useDispatch()
  const contact = useSelector(getSelectedContact)
  const isLoading = useSelector(getSelectedContactLoading)
  const error = useSelector(getSelectedContactError)
  const media = useSelector(getSharedMedia)
  const mediaHasMore = useSelector(getSharedMediaHasMore)
  const isMediaLoading = useSelector(getSharedMediaLoading)
  const onlineUserIds = useSelector(getOnlineUsers)
  const [openedMedia, setOpenedMedia] = useState(null)
  const [showAllMedia, setShowAllMedia] = useState(false)

  useEffect(() => {
    dispatch(fetchContactDetails(userId))
    dispatch(fetchSharedMedia({ userId }))
    return () => {
      dispatch(clearSelectedContact())
    }
  }, [dispatch, userId])

  if (showAllMedia) {
    return <SharedMediaScreen userId={userId} onBack={() => setShowAllMedia(false)} className={className} />
  }

  const online = onlineUserIds.includes(userId)
  const hasMoreToShow = media.length > PREVIEW_COUNT || mediaHasMore

  return (
    <section className={`flex-1 min-w-0 min-h-0 flex flex-col bg-white ${className}`}>
      <BackHeader title="Contact Details" onBack={onBack}>
        <IconButton aria-label="more options" sx={squareButtonSx}><MoreVertRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
      </BackHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-4 bg-[#fafaff]">
        {isLoading && <div className="flex justify-center py-10"><CircularProgress size={28} /></div>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {contact && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <UserAvatar user={contact} online={online} size={96} />
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{fullName(contact)}</h2>
                <p className={`flex items-center justify-center sm:justify-start gap-1.5 mt-1 font-medium ${online ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-slate-300'}`} />
                  {online ? 'Online' : formatLastSeen(contact.lastSeen)}
                </p>
                {contact.designation && <p className="text-indigo-600 font-medium mt-2">{contact.designation}</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-4">
              <h3 className="text-lg font-bold text-slate-900">About</h3>
              <p className="text-slate-700 mt-1 break-words">{contact.about || 'No about added yet.'}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-900">Shared Media</h3>
                {hasMoreToShow && (
                  <button type="button" onClick={() => setShowAllMedia(true)}
                    className="text-sm text-indigo-600 font-medium flex items-center gap-1 cursor-pointer">
                    View all <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </button>
                )}
              </div>

              {media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {media.slice(0, PREVIEW_COUNT).map((item) => (
                    <button type="button" key={item._id} onClick={() => setOpenedMedia(item)}
                      className="block rounded-xl overflow-hidden cursor-pointer">
                      <MediaThumbnail url={item.url} type={item.messageType} mediaClassName="w-full aspect-video" playIconSize={24} />
                    </button>
                  ))}
                </div>
              )}

              {isMediaLoading && <div className="flex justify-center py-4"><CircularProgress size={22} /></div>}
              {!isMediaLoading && media.length === 0 && <p className="text-sm text-slate-500">No photos or videos shared yet.</p>}
            </div>
          </>
        )}
      </div>

      {openedMedia && <MediaLightbox open onClose={() => setOpenedMedia(null)} url={openedMedia.url} type={openedMedia.messageType} />}
    </section>
  )
}

export default ContactDetails
