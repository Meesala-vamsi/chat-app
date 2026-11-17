// Cloudinary links: adding "fl_attachment" makes the browser download the file instead of opening it.
export const downloadUrl = (url) => url.replace('/upload/', '/upload/fl_attachment/')

export const fileExtension = (url) => url.split('?')[0].split('.').pop().toUpperCase()

// 75 -> "1:15"
export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

// 1536000 -> "1.5 MB"
export const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// the same limits as the server (uploadMiddleware.js)
export const MAX_FILES = 5
export const MAX_FILE_SIZE_MB = 20

// "image" | "video" | "audio" | "file", from the file's mime type
export const fileKind = (file) => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'file'
}
