import React, { useEffect, useMemo } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import MediaThumbnail from './MediaThumbnail'
import { fileKind, formatFileSize } from '../../utils/mediaHelpers'

const FileTile = ({ file, previewUrl, disabled, onRemove }) => {
  const kind = fileKind(file)
  const isVisual = kind === 'image' || kind === 'video'

  return (
    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
      {isVisual && <MediaThumbnail url={previewUrl} type={kind} mediaClassName="w-20 h-20" playIconSize={18} />}
      {kind === 'audio' && <AudiotrackRoundedIcon className="text-violet-500" />}
      {kind === 'file' && <InsertDriveFileOutlinedIcon className="text-indigo-500" />}

      {!isVisual && (
        <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[9px] text-slate-600 text-center truncate px-1">{formatFileSize(file.size)}</span>
      )}

      {!disabled && (
        <button type="button" onClick={onRemove} aria-label={`remove ${file.name}`}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer">
          <CloseRoundedIcon sx={{ fontSize: 14 }} />
        </button>
      )}
    </div>
  )
}

// The files the user picked, shown above the message box before they are sent.
// onRemove(index) is called when the X of a file is pressed; disabled hides the X (while uploading).
const FilePreviewTray = ({ files, onRemove, disabled = false }) => {
  // temporary browser links to show the picked files; released again when the files change
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls])

  if (files.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-3">
      {files.map((file, index) => (
        <FileTile key={`${file.name}-${index}`} file={file} previewUrl={previewUrls[index]} disabled={disabled} onRemove={() => onRemove(index)} />
      ))}
    </div>
  )
}

export default FilePreviewTray
