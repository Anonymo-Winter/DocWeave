import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        isAuthenticated: false, // Add this line
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true; // Set this when user is logged in
        },
        clearCredentials: (state) => {
            state.user = null;
            state.isAuthenticated = false; // Clear when user logs out
        },
    },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
