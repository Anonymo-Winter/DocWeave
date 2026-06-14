import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { clearCredentials, setCredentials, setToken } from '../store/userSlice';
import { API_URL as backendUrl } from '../config';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: backendUrl,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().user.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
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
                    setTimeout(() => dispatch(setCredentials(data.user)), 3000);
                    dispatch(setToken(data.token));
                } catch (err) {
                    console.error('Login error:', err);
                }
            },
            invalidatesTags: ['User'],
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
                    dispatch(setToken(data.token));
                } catch (err) {
                    console.error('Signup error:', err);
                }
            },
        }),
        checkAuth: builder.query({
            query: () => '/auth/check-auth',
            providesTags: ['User'],
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    setTimeout(() => dispatch(setCredentials(data.user)), 2000);
                } catch {
                    dispatch(clearCredentials());
                }
            },
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(clearCredentials());
                } catch (err) {
                    console.error('Logout error:', err);
                }
            },
            invalidatesTags: ['User'],
        }),
        searchForEmail: builder.mutation({
            query: ({ emailTerm, editorId }) => ({
                url: '/auth/search',
                method: 'POST',
                body: { emailTerm, editorId },
            }),
        }),
        googleAuth: builder.mutation({
            query: ({ accessToken }) => ({
                url: '/auth/google',
                method: 'POST',
                body: { accessToken },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.user));
                    dispatch(setToken(data.token));
                } catch (err) {
                    console.error('Google auth error:', err);
                }
            },
            invalidatesTags: ['User'],
        }),
        updateProfile: builder.mutation({
            query: ({ name, image }) => ({
                url: '/auth/profile',
                method: 'PATCH',
                body: { name, image },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.user) dispatch(setCredentials(data.user));
                    if (data?.token) dispatch(setToken(data.token));
                } catch (err) {
                    console.error('Update profile error:', err);
                }
            },
            invalidatesTags: ['User'],
        }),
        forgotPassword: builder.mutation({
            query: ({ email }) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: { token, password },
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useCheckAuthQuery,
    useLogoutMutation,
    useSearchForEmailMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGoogleAuthMutation,
    useUpdateProfileMutation,
} = userApi;
