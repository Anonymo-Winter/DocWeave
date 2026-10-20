import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL as backendUrl } from '../config';

export const versionApi = createApi({
    reducerPath: 'versionApi',
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
    tagTypes: ['Version'],
    endpoints: (builder) => ({
        updateVersion: builder.mutation({
            query: ({ documentId, title, description, versionId }) => ({
                url: `/version/${documentId}`,
                method: 'POST',
                body: { title, description, versionId },
            }),
        }),
        deleteVersion: builder.mutation({
            query: ({ documentId, versionId }) => ({
                url: `/version/${documentId}`,
                method: 'DELETE',
                body: { versionId },
            }),
        }),
        toggleVersionStar: builder.mutation({
            query: ({ versionId }) => ({
                url: `/version/star`,
                method: 'PATCH',
                body: { versionId },
            }),
        }),
    }),
});

export const { useUpdateVersionMutation, useDeleteVersionMutation, useToggleVersionStarMutation } = versionApi;
