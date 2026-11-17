import React from 'react'
import { Dialog, IconButton } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { downloadUrl } from '../../utils/mediaHelpers'

// Full screen viewer for an image or a video (opened by clicking it in the chat).
const MediaLightbox = ({ open, onClose, url, type }) => (
  <Dialog open={open} onClose={onClose} fullScreen slotProps={{ paper: { sx: { bgcolor: 'rgba(0,0,0,0.92)' } } }}>
    <div className="h-full flex flex-col">
      <div className="flex justify-end gap-1 p-3">
        <IconButton component="a" href={downloadUrl(url)} aria-label="download" sx={{ color: '#fff' }}><DownloadRoundedIcon /></IconButton>
        <IconButton onClick={onClose} aria-label="close" sx={{ color: '#fff' }}><CloseRoundedIcon /></IconButton>
      </div>
      {/* clicking the dark area around the media closes the viewer */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-3 pt-0" onClick={onClose}>
        {type === 'video'
          ? <video src={url} controls autoPlay playsInline onClick={(event) => event.stopPropagation()} className="max-w-full max-h-full rounded-lg" />
          : <img src={url} alt="" onClick={(event) => event.stopPropagation()} className="max-w-full max-h-full object-contain rounded-lg" />}
      </div>
    </div>
  </Dialog>
)

export default MediaLightbox
