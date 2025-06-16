import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: 'user_api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.query({
            query: ({ email, password }) => ({
                url: '/auth/login',
                method: 'POST',
                body: { email, password },
            }),
        }),
    }),
});

export const { useLoginQuery } = userApi;
