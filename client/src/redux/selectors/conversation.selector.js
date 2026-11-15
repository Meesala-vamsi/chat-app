export const getConversations = (state) => state.conversation.conversations;
export const getUnreadCounts = (state) => state.conversation.unreadCounts;
export const getTotalUnread = (state) => Object.values(state.conversation.unreadCounts).reduce((sum, n) => sum + n, 0);
