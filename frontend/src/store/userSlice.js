import { createSlice } from '@reduxjs/toolkit';
const userSlice = createSlice({
    name: 'user_api',
    initialState: {
        user: null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
        },
        clearCredentials: (state) => {
            state.user = null;
        },
    },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
