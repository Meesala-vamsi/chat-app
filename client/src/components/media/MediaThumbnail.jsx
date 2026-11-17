import React from 'react'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'

// An image, or the first frame of a video with a play icon on top.
// url can also be a temporary link of a file picked from the device.
// mediaClassName: size classes for the image / video; children: anything to draw on top (like the time).
const MediaThumbnail = ({ url, type, mediaClassName = '', playIconSize = 32, children }) => (
  <div className="relative">
    {type === 'video' ? (
      <>
        {/* "#t=0.1" makes the browser show the first frame as the thumbnail */}
        <video src={`${url}#t=0.1`} preload="metadata" muted playsInline className={`block object-cover bg-black ${mediaClassName}`} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/55 text-white flex items-center justify-center p-1.5"><PlayArrowRoundedIcon sx={{ fontSize: playIconSize }} /></span>
        </span>
      </>
    ) : (
      <img src={url} alt="" loading="lazy" className={`block object-cover ${mediaClassName}`} />
    )}
    {children}
  </div>
)

export default MediaThumbnail
