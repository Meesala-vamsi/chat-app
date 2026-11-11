export const getMessages = (state) => state.message.messages;
export const getMessagesLoading = (state) => state.message.isLoading;
export const getMessageSending = (state) => state.message.isSending;
export const getMessagesError = (state) => state.message.error;
export const getMessagesNextCursor = (state) => state.message.nextCursor;
export const getMessagesHasMore = (state) => state.message.hasMore;
