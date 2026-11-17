import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, CircularProgress, IconButton } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import debounce from 'lodash.debounce'
import UserAvatar from '../common/UserAvatar'
import ContactDetails from './ContactDetails'
import { fetchContacts } from '../../redux/slices/contactSlice'
import { getContacts, getContactsError, getContactsHasMore, getContactsLoading, getContactsPage, getContactsTotal } from '../../redux/selectors/contact.selector'
import { getOnlineUsers } from '../../redux/selectors/user.selector'
import { formatLastSeen, fullName } from '../../utils/chatHelpers'

const chatButtonSx = {
  textTransform: 'none', fontWeight: 600, fontSize: 13, borderRadius: '10px', px: 2.5, py: 0.8, flexShrink: 0,
  color: '#1e1b4b', bgcolor: '#eceefb', boxShadow: 'none', '&:hover': { bgcolor: '#e0e3f7', boxShadow: 'none' },
}

const ContactsPanel = ({ onChat, className = '' }) => {
  const dispatch = useDispatch()
  const contacts = useSelector(getContacts)
  const total = useSelector(getContactsTotal)
  const page = useSelector(getContactsPage)
  const hasMore = useSelector(getContactsHasMore)
  const isLoading = useSelector(getContactsLoading)
  const error = useSelector(getContactsError)
  const onlineUserIds = useSelector(getOnlineUsers)
  const [search, setSearch] = useState('')
  const [selectedContactId, setSelectedContactId] = useState(null)
  const searchTerm = search.trim()

  const loadContactsDebounced = useMemo(
    () => debounce((term) => dispatch(fetchContacts({ search: term, page: 1 })), 400),
    [dispatch]
  )

  useEffect(() => {
    if (searchTerm) {
      loadContactsDebounced(searchTerm)
    } else {
      loadContactsDebounced.cancel()
      dispatch(fetchContacts({ search: '', page: 1 }))
    }
    return () => loadContactsDebounced.cancel()
  }, [searchTerm, loadContactsDebounced, dispatch])

  if (selectedContactId) {
    return (
      <ContactDetails
        userId={selectedContactId}
        onBack={() => setSelectedContactId(null)}
        className={className}
      />
    )
  }

  return (
    <section className={`flex-1 min-w-0 min-h-0 flex flex-col bg-white ${className}`}>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Contacts</h1>
          <p className="text-sm text-slate-500 truncate">Find and connect with people</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-72 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
            <SearchRoundedIcon className="text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts..."
              className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
          </div>
          <IconButton aria-label="people" sx={{ bgcolor: '#eef0ff', color: '#4f46e5', borderRadius: '14px', width: 44, height: 44, '&:hover': { bgcolor: '#e0e3ff' } }}>
            <PeopleAltRoundedIcon />
          </IconButton>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-[#fafaff]">
        <h2 className="text-lg font-bold text-slate-900 mb-3">All Contacts ({total})</h2>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {contacts.map((contact) => {
            const online = onlineUserIds.includes(contact._id)
            return (
              <div key={contact._id} className="flex items-center gap-3 pr-4 sm:pr-5 hover:bg-slate-50 transition-colors">
                <button type="button" onClick={() => setSelectedContactId(contact._id)}
                  className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 pl-4 sm:pl-5 py-3.5 text-left cursor-pointer">
                  <UserAvatar user={contact} online={online} size={48} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{fullName(contact)}</p>
                    <p className="text-sm text-slate-500 truncate flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-green-500' : 'bg-slate-300'}`} />
                      {online ? 'Online' : formatLastSeen(contact.lastSeen)}
                    </p>
                  </div>
                </button>
                <Button variant="contained" size="small" onClick={() => onChat(contact)} sx={chatButtonSx}>Chat</Button>
              </div>
            )
          })}

          {isLoading && <div className="flex justify-center py-5"><CircularProgress size={24} /></div>}
          {error && <p className="px-5 py-5 text-sm text-red-500">{error}</p>}
          {!isLoading && !error && contacts.length === 0 && (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">
              {searchTerm ? `No contacts found for "${searchTerm}"` : 'No contacts yet'}
            </p>
          )}
        </div>

        {hasMore && !isLoading && (
          <div className="flex justify-center pt-4">
            <Button onClick={() => dispatch(fetchContacts({ search: searchTerm, page: page + 1 }))} sx={{ textTransform: 'none' }}>Load more</Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ContactsPanel
