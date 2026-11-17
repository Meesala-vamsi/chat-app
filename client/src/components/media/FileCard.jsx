import React from 'react'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { downloadUrl, fileExtension } from '../../utils/mediaHelpers'

// A document (pdf, doc, ...) shown as a small card; clicking it downloads the file.
const FileCard = ({ url, className = '' }) => (
  <a href={downloadUrl(url)} className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors ${className}`}>
    <div className="w-10 h-10 shrink-0 rounded-lg bg-white text-indigo-600 flex items-center justify-center"><InsertDriveFileOutlinedIcon /></div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-slate-800 truncate">Document</p>
      <p className="text-[11px] text-slate-500">{fileExtension(url)} file</p>
    </div>
    <DownloadRoundedIcon className="text-slate-500" />
  </a>
)

export default FileCard
