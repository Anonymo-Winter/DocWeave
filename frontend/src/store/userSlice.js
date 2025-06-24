import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false, // Add this line
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true; // Set this when user is logged in
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false; // Clear when user logs out
        },
    },
});

export const { setCredentials, clearCredentials, setToken } = userSlice.actions;
export default userSlice.reducer;
