import React, { useState } from 'react'
import AudioPlayer from '../media/AudioPlayer'
import FileCard from '../media/FileCard'
import MediaThumbnail from '../media/MediaThumbnail'
import MediaLightbox from '../media/MediaLightbox'
import MessageTime from './MessageTime'

// The bubble of a message that has media (image, video, audio or file) and an optional caption (m.content).
// It only decides the layout; the media itself is drawn by the reusable components in components/media.
const MessageMedia = ({ m, mine }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const url = m.attachments?.[0]
  const caption = m.content?.trim()
  const isVisual = m.messageType === 'image' || m.messageType === 'video'

  if (!url) return null

  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden ${mine ? 'bg-indigo-100 rounded-br-sm' : 'bg-white rounded-bl-sm'} ${isVisual ? 'p-1' : 'px-2.5 py-1.5'}`}>
      {isVisual && (
        <button type="button" onClick={() => setIsViewerOpen(true)} className="block rounded-xl overflow-hidden cursor-pointer">
          <MediaThumbnail url={url} type={m.messageType} mediaClassName="w-64 sm:w-72 max-h-80">
            {/* no caption: the time sits on the media itself, like WhatsApp */}
            {!caption && <span className="absolute bottom-1.5 right-1.5"><MessageTime m={m} mine={mine} overlay /></span>}
          </MediaThumbnail>
        </button>
      )}

      {m.messageType === 'audio' && <AudioPlayer url={url} accentClass={mine ? 'bg-indigo-500' : 'bg-violet-500'} className="w-60 sm:w-64" />}
      {m.messageType === 'file' && <FileCard url={url} className="w-60 sm:w-64" />}

      {caption && <p className={`text-[13px] leading-snug break-words text-slate-900 ${isVisual ? 'px-2 pt-1.5' : 'pt-1.5'}`}>{caption}</p>}

      {(caption || !isVisual) && (
        <div className={`flex justify-end ${isVisual ? 'px-2 pb-1' : 'pt-0.5'}`}><MessageTime m={m} mine={mine} /></div>
      )}

      {isVisual && <MediaLightbox open={isViewerOpen} onClose={() => setIsViewerOpen(false)} url={url} type={m.messageType} />}
    </div>
  )
}

export default MessageMedia
