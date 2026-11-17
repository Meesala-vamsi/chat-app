import React, { useRef, useState } from 'react'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import { formatDuration } from '../../utils/mediaHelpers'

// heights (in %) of the bars that imitate a voice message waveform
const waveformBars = [30, 55, 40, 70, 90, 60, 35, 50, 80, 100, 65, 45, 30, 55, 75, 95, 60, 40, 55, 85, 70, 45, 30, 50, 65, 40, 25, 35]

// WhatsApp style audio player: round play button, waveform you can click to seek, and the time.
// accentClass: background colour class of the play button and the played part of the waveform.
const AudioPlayer = ({ url, accentClass = 'bg-violet-500', className = '' }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => (isPlaying ? audioRef.current.pause() : audioRef.current.play())

  const seek = (event) => {
    if (!duration) return
    const box = event.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = ((event.clientX - box.left) / box.width) * duration
  }

  const progress = duration ? currentTime / duration : 0

  return (
    <div className={`flex items-center gap-3 px-1 py-1 ${className}`}>
      <audio ref={audioRef} src={url} preload="metadata"
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0) }}
        onTimeUpdate={(event) => setCurrentTime(event.target.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.target.duration)} />

      <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'pause' : 'play'}
        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white cursor-pointer ${accentClass}`}>
        {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
      </button>

      <div className="flex-1 min-w-0">
        <div onClick={seek} className="flex items-center gap-[2px] h-7 cursor-pointer">
          {waveformBars.map((height, index) => (
            <span key={index} style={{ height: `${height}%` }}
              className={`flex-1 rounded-full ${index / waveformBars.length < progress ? accentClass : 'bg-slate-300'}`} />
          ))}
        </div>
        {/* shows the full length until it is played, then the time played */}
        <span className="text-[10px] text-slate-500">{formatDuration(isPlaying || currentTime ? currentTime : duration)}</span>
      </div>
    </div>
  )
}

export default AudioPlayer
