import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, Button, CircularProgress } from '@mui/material'
import { searchUsers } from '../../redux/slices/userSlice'
import { getSearchedUsers, getUsersError, getUsersHasMore, getUsersLoading, getUsersPage } from '../../redux/selectors/user.selector'
import { colorFor, fullName, initialsOf } from '../../utils/chatHelpers'

const UserSearchResults = ({ search, onSelectUser }) => {
  const dispatch = useDispatch()
  const users = useSelector(getSearchedUsers)
  const isLoading = useSelector(getUsersLoading)
  const error = useSelector(getUsersError)
  const hasMore = useSelector(getUsersHasMore)
  const page = useSelector(getUsersPage)

  const loadMoreUsers = () => dispatch(searchUsers({ search, page: page + 1 }))

  return (
    <div className="px-2 pt-3">
      <h3 className="px-3 pb-2 text-lg font-bold text-slate-900">Users</h3>

      {users.map((user) => (
        <button key={user._id} onClick={() => onSelectUser?.(user)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition">
          <Avatar sx={{ bgcolor: colorFor(user._id), width: 48, height: 48 }}>{initialsOf(fullName(user))}</Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{fullName(user)}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
        </button>
      ))}

      {isLoading && <div className="flex justify-center py-4"><CircularProgress size={24} /></div>}
      {error && <p className="px-3 py-4 text-sm text-red-500">{error}</p>}
      {!isLoading && !error && users.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No users found for "{search}"</p>}

      {hasMore && !isLoading && (
        <div className="flex justify-center py-3">
          <Button onClick={loadMoreUsers} sx={{ textTransform: 'none' }}>Load more</Button>
        </div>
      )}
    </div>
  )
}

export default UserSearchResults
