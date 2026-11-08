// Mock data shaped exactly like the server responses.
// - currentUser           -> `data.user` from POST /api/auth/login
// - conversations         -> `data.conversations` from GET /api/conversations (participants + lastMessage populated)
// - messagesByConversation-> `data.messages` from GET /api/messages/:conversationId (senderId populated)
// - onlineUserIds         -> not provided by the server yet; feed it from socket.io presence later.

export const currentUser = {
  _id: "65f000000000000000000001",
  firstName: "Vamsi",
  lastName: "Meesala",
  email: "vamsi@example.com",
}

const user = (n, firstName, lastName) => ({
  _id: `65f0000000000000000000${String(n).padStart(2, "0")}`,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}@example.com`,
  createdAt: "2026-10-01T09:00:00.000Z",
  updatedAt: "2026-10-01T09:00:00.000Z",
})

const rahul = user(2, "Rahul", "Sharma")
const priya = user(3, "Priya", "Reddy")
const arjun = user(4, "Arjun", "Kumar")
const sneha = user(5, "Sneha", "Patel")
const kiran = user(6, "Kiran", "Kumar")

export const onlineUserIds = [rahul._id, arjun._id]

const msg = (id, conversationId, sender, content, createdAt, extra = {}) => ({
  _id: id,
  conversationId,
  senderId: sender,
  messageType: "text",
  content,
  attachments: [],
  readBy: [],
  createdAt,
  updatedAt: createdAt,
  ...extra,
})

const readBy = (u, at) => [{ userId: u._id, readAt: at }]

const C = (n) => `66a0000000000000000000${String(n).padStart(2, "0")}`

export const messagesByConversation = {
  [C(1)]: [
    msg("67b000000000000000000001", C(1), rahul, "Hey! How are you?", "2026-11-07T10:45:00.000Z", { readBy: readBy(currentUser, "2026-11-07T10:46:00.000Z") }),
    msg("67b000000000000000000002", C(1), currentUser, "I'm good! What about you?", "2026-11-07T10:46:00.000Z", { readBy: readBy(rahul, "2026-11-07T10:46:30.000Z") }),
    msg("67b000000000000000000003", C(1), rahul, "Working on the chat application.", "2026-11-07T10:47:00.000Z", { readBy: readBy(currentUser, "2026-11-07T10:47:10.000Z") }),
    msg("67b000000000000000000004", C(1), currentUser, "That's awesome 👍", "2026-11-07T10:48:00.000Z", { readBy: readBy(rahul, "2026-11-07T10:48:20.000Z") }),
    msg("67b000000000000000000005", C(1), rahul, "That's great! Looking forward to seeing it.", "2026-11-07T10:49:00.000Z", { readBy: readBy(currentUser, "2026-11-07T10:49:10.000Z") }),
    msg("67b000000000000000000006", C(1), currentUser, "", "2026-11-07T10:50:00.000Z", {
      messageType: "image",
      attachments: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"],
      readBy: readBy(rahul, "2026-11-07T10:50:30.000Z"),
    }),
  ],
}

// lastMessage is populated by the server, so it is a full message object (senderId is a plain id here).
const last = (id, convId, senderId, content, createdAt, read = []) => ({
  _id: id, conversationId: convId, senderId, messageType: "text", content, attachments: [], readBy: read, createdAt, updatedAt: createdAt,
})

const direct = (n, other, lastMsg) => ({
  _id: C(n),
  type: "direct",
  participants: [currentUser, other],
  createdBy: currentUser._id,
  groupName: "",
  groupImage: "",
  lastMessage: lastMsg,
  lastMessageAt: lastMsg.createdAt,
  conversationKey: [currentUser._id, other._id].sort().join("_"),
  createdAt: "2026-10-20T09:00:00.000Z",
  updatedAt: lastMsg.createdAt,
})

const group = (n, name, members, lastMsg) => ({
  _id: C(n),
  type: "group",
  participants: [currentUser, ...members],
  createdBy: currentUser._id,
  groupName: name,
  groupImage: "",
  lastMessage: lastMsg,
  lastMessageAt: lastMsg.createdAt,
  createdAt: "2026-10-10T09:00:00.000Z",
  updatedAt: lastMsg.createdAt,
})

// Sorted by lastMessageAt desc, like the server.
export const conversations = [
  direct(1, rahul, { ...last("67b000000000000000000006", C(1), currentUser._id, "", "2026-11-07T10:50:00.000Z", readBy(rahul, "2026-11-07T10:50:30.000Z")), messageType: "image" }),
  group(101, "Developers Crew", [rahul, arjun], last("67b000000000000000000101", C(101), rahul._id, "Deploy done 🎉", "2026-11-07T08:45:00.000Z")),
  direct(2, priya, last("67b000000000000000000102", C(2), priya._id, "Great! Let's catch up...", "2026-11-07T10:15:00.000Z")),
  direct(3, arjun, last("67b000000000000000000103", C(3), arjun._id, "See you tomorrow!", "2026-11-07T07:50:00.000Z", readBy(currentUser, "2026-11-07T08:00:00.000Z"))),
  direct(4, sneha, last("67b000000000000000000104", C(4), sneha._id, "Thanks for the help 😊", "2026-11-06T15:00:00.000Z", readBy(currentUser, "2026-11-06T15:05:00.000Z"))),
  direct(5, kiran, last("67b000000000000000000105", C(5), kiran._id, "Absolutely!", "2026-11-03T12:00:00.000Z", readBy(currentUser, "2026-11-03T12:05:00.000Z"))),
  group(102, "Study Group", [priya, sneha], last("67b000000000000000000106", C(102), priya._id, "Next class on Sunday?", "2026-11-01T12:00:00.000Z", readBy(currentUser, "2026-11-01T12:10:00.000Z"))),
]
