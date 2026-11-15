import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, Button, Chip, CircularProgress, Dialog, IconButton } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import debounce from 'lodash.debounce'
import { clearUsers, searchUsers } from '../../redux/slices/userSlice'
import { getSearchedUsers, getUsersHasMore, getUsersLoading, getUsersPage } from '../../redux/selectors/user.selector'
import { getUserDetails } from '../../redux/selectors/auth.selector'
import { colorFor, fullName, initialsOf } from '../../utils/chatHelpers'

// onCreate({ groupName, memberIds }) is called when the user presses "Create Group".
const CreateGroupDialog = ({ open, onClose, onCreate }) => {
  const dispatch = useDispatch()
  const currentUser = useSelector(getUserDetails)
  const foundUsers = useSelector(getSearchedUsers)
  const isLoading = useSelector(getUsersLoading)
  const hasMore = useSelector(getUsersHasMore)
  const page = useSelector(getUsersPage)

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const searchTerm = search.trim()

  const searchUsersDebounced = useMemo(
    () => debounce((term) => dispatch(searchUsers({ search: term, page: 1 })), 400),
    [dispatch]
  )

  useEffect(() => {
    if (!open) return
    if (searchTerm) {
      searchUsersDebounced(searchTerm)
    } else {
      searchUsersDebounced.cancel()
      dispatch(clearUsers())
    }
    return () => searchUsersDebounced.cancel()
  }, [open, searchTerm, searchUsersDebounced, dispatch])

  const closeDialog = () => {
    setGroupName('')
    setSearch('')
    setSelectedUsers([])
    dispatch(clearUsers())
    onClose()
  }

  const isSelected = (user) => selectedUsers.some((selected) => selected._id === user._id)

  const toggleUser = (user) => {
    setSelectedUsers((previous) =>
      isSelected(user) ? previous.filter((selected) => selected._id !== user._id) : [...previous, user]
    )
  }

  // you are always part of the group, so the other members are enough
  const searchResults = foundUsers.filter((user) => user._id !== currentUser?._id)
  const canCreate = groupName.trim().length > 0 && selectedUsers.length >= 1

  const onSubmit = (event) => {
    event.preventDefault()
    if (!canCreate) return
    onCreate?.({ groupName: groupName.trim(), memberIds: selectedUsers.map((user) => user._id) })
    closeDialog()
  }

  return (
    <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: '20px', m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)' } } }}>
      <form onSubmit={onSubmit} className="flex flex-col min-h-0">
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><GroupsRoundedIcon /></div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Create Group</h2>
              <p className="text-xs text-slate-500">Name your group and add members</p>
            </div>
          </div>
          <IconButton onClick={closeDialog} aria-label="close"><CloseRoundedIcon /></IconButton>
        </header>

        <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto min-h-0">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Group name</span>
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={50} placeholder="e.g. Weekend Plans"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors" />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Members {selectedUsers.length > 0 && `(${selectedUsers.length})`}</span>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Chip key={user._id} label={fullName(user)} onDelete={() => toggleUser(user)}
                    avatar={<Avatar sx={{ bgcolor: `${colorFor(user._id)} !important`, color: '#fff !important' }}>{initialsOf(fullName(user))}</Avatar>}
                    sx={{ bgcolor: '#eef2ff', color: '#3730a3', fontWeight: 500 }} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <SearchRoundedIcon className="text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users to add"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
            </div>

            <div className="h-56 overflow-y-auto rounded-xl border border-slate-100">
              {!searchTerm && <p className="px-4 py-6 text-sm text-slate-500 text-center">Search for people to add to the group</p>}

              {searchTerm && searchResults.map((user) => (
                <button type="button" key={user._id} onClick={() => toggleUser(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition cursor-pointer">
                  <Avatar sx={{ bgcolor: colorFor(user._id), width: 40, height: 40, fontSize: 15 }}>{initialsOf(fullName(user))}</Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{fullName(user)}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <CheckCircleRoundedIcon sx={{ fontSize: 22 }} className={isSelected(user) ? 'text-indigo-600' : 'text-slate-200'} />
                </button>
              ))}

              {searchTerm && isLoading && <div className="flex justify-center py-4"><CircularProgress size={22} /></div>}
              {searchTerm && !isLoading && searchResults.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 text-center">No users found for "{searchTerm}"</p>}

              {searchTerm && hasMore && !isLoading && (
                <div className="flex justify-center py-2">
                  <Button onClick={() => dispatch(searchUsers({ search: searchTerm, page: page + 1 }))} sx={{ textTransform: 'none' }}>Load more</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100">
          <Button onClick={closeDialog} sx={{ textTransform: 'none', fontWeight: 600, color: '#475569' }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!canCreate}
            sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 600, borderRadius: '12px', px: 3, boxShadow: 'none', '&:hover': { bgcolor: '#4338ca', boxShadow: 'none' } }}>
            Create Group
          </Button>
        </footer>
      </form>
    </Dialog>
  )
}

export default CreateGroupDialog
