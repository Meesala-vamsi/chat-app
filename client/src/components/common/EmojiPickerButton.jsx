import { useState } from 'react'
import { IconButton, Popover } from '@mui/material'
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import EmojiPicker from 'emoji-picker-react'

const EmojiPickerButton = ({ onSelect, onClose, disabled = false }) => {
  const [anchor, setAnchor] = useState(null)

  const closePicker = () => {
    setAnchor(null)
    onClose?.()
  }

  return (
    <>
      <IconButton aria-label="emoji" disabled={disabled} onClick={(event) => setAnchor(event.currentTarget)}>
        <SentimentSatisfiedAltOutlinedIcon />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: '16px', mt: -1, overflow: 'hidden', boxShadow: '0 12px 32px rgba(15,23,42,0.18)' } } }}
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
          width="min(350px, calc(100vw - 32px))"
          height={380}
          lazyLoadEmojis
          skinTonesDisabled
          previewConfig={{ showPreview: false }}
          searchPlaceHolder="Search emoji"
        />
      </Popover>
    </>
  )
}

export default EmojiPickerButton
