const AVATAR_COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"]

export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}`.trim() : "")
export const initialsOf = (name = "") => name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()

// Stable colour per id, since the server stores no avatar.
export const colorFor = (id = "") => AVATAR_COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b)

// The other participant of a direct conversation.
export const otherUser = (conv, me) => conv.participants.find((p) => !sameId(p, me))

export const conversationTitle = (conv, me) => (conv.type === "group" ? conv.groupName : fullName(otherUser(conv, me)))

export const isMine = (message, me) => sameId(message.senderId, me)

export const isReadByOthers = (message) => (message.readBy?.length ?? 0) > 0

// Server has no unread counter; with only lastMessage populated we can tell "unread or not".
export const hasUnreadLast = (conv, me) => {
  const m = conv.lastMessage
  return !!m && !sameId(m.senderId, me) && !m.readBy?.some((r) => sameId(r.userId, me))
}

export const lastMessagePreview = (conv, me) => {
  const m = conv.lastMessage
  if (!m) return "No messages yet"
  const text = m.messageType === "text" ? m.content : `📎 ${m.messageType[0].toUpperCase()}${m.messageType.slice(1)}`
  if (conv.type !== "group") return text
  const sender = conv.participants.find((p) => sameId(p, m.senderId))
  return `${sameId(sender, me) ? "You" : sender?.firstName}: ${text}`
}

export const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

// "4:20 PM" today, "Yesterday", weekday within a week, otherwise a short date.
export const formatListTime = (iso) => {
  if (!iso) return ""
  const d = new Date(iso), now = new Date()
  const days = Math.round((new Date(now.toDateString()) - new Date(d.toDateString())) / 86400000)
  if (days <= 0) return formatTime(iso)
  if (days === 1) return "Yesterday"
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { day: "numeric", month: "short" })
}
