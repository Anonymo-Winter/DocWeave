import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { clearCredentials, setCredentials } from '../store/userSlice';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        credentials: 'include',
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({ email, password }) => ({
                url: '/auth/login',
                method: 'POST',
                body: { email, password },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.user));
                } catch (err) {
                    console.error('Login error:', err);
                }
            },
        }),
        register: builder.mutation({
            query: ({ email, password, name }) => ({
                url: '/auth/register',
                method: 'POST',
                body: { email, password, name },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.user));
                } catch (err) {
                    console.error('Signup error:', err);
                }
            },
        }),
        checkAuth: builder.query({
            query: () => '/auth/check-auth',
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.user)); // optional
                } catch (error) {
                    dispatch(clearCredentials());
                }
            },
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useCheckAuthQuery } = userApi;
