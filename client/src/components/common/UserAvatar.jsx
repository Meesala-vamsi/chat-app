import { Avatar, Badge } from '@mui/material'
import { colorFor, fullName, initialsOf } from '../../utils/chatHelpers'

const UserAvatar = ({ user, online = false, size = 48 }) => (
  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!online}
    sx={{ '& .MuiBadge-badge': { backgroundColor: '#22c55e', color: '#22c55e', border: '2px solid #fff' } }}>
    <Avatar src={user.avatar || undefined} sx={{ bgcolor: colorFor(user._id), width: size, height: size, fontSize: size * 0.38 }}>
      {initialsOf(fullName(user))}
    </Avatar>
  </Badge>
)

export default UserAvatar
