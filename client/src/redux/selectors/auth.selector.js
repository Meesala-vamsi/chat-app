export const loginAccessToken = (state) => state.auth.accessToken;
export const authStatus = (state) => state.auth.isAuthenticated;
export const checkRefreshStatus = (state) => state.auth.isCheckingAuth;
export const getUserDetails = (state) => state.auth.user;