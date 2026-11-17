import React, { useRef } from 'react'
import { IconButton } from '@mui/material'

// An icon button that opens the device's file picker. Put the icon inside it.
// onPick(files) gets the chosen files as an array. accept: the same string as <input accept>.
const FilePickerButton = ({ accept, onPick, label, disabled = false, children }) => {
  const inputRef = useRef(null)

  const onChooseFiles = (event) => {
    onPick(Array.from(event.target.files))
    // reset, so choosing the same file again still triggers onChange
    event.target.value = ''
  }

  return (
    <>
      <input ref={inputRef} type="file" multiple hidden accept={accept} onChange={onChooseFiles} />
      <IconButton size="small" aria-label={label} disabled={disabled} onClick={() => inputRef.current.click()}>{children}</IconButton>
    </>
  )
}

export default FilePickerButton
