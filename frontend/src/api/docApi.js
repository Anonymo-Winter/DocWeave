import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const hostname = window.location.hostname;
const backendUrl = hostname === 'localhost' ? 'http://localhost:5000/api' : `${import.meta.env.VITE_BACKEND_URL}/api`;

export const docApi = createApi({
    reducerPath: 'docApi',
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
    tagTypes: ['Doc'],
    endpoints: (builder) => ({
        createDocument: builder.mutation({
            query: ({ templateName }) => ({
                url: '/doc/create',
                method: 'POST',
                body: { templateName },
            }),
        }),
        saveVersion: builder.mutation({
            query: ({ documentId, update, name, changes, wordCount, collaborators, author, description }) => ({
                url: '/doc/save-version',
                method: 'POST',
                body: {
                    documentId,
                    update,
                    name,
                    changes,
                    wordCount,
                    collaborators,
                    description,
                    author,
                },
            }),
        }),
        getVersion: builder.query({
            query: ({ editorId }) => {
                return `/doc/version/${editorId}`;
            },
        }),
    }),
});

export const { useSaveVersionMutation, useGetVersionQuery, useCreateDocumentMutation } = docApi;
