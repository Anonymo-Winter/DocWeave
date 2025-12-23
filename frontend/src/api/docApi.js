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
        getDocument: builder.query({
            query: (editorId) => {
                return `/doc/document/${editorId}`;
            },
        }),
        updateDocument: builder.mutation({
            query: ({ visibility, userswithupdatedrole, editorId }) => ({
                url: `/doc/document/${editorId}`,
                method: 'POST',
                body: { visibility, userswithupdatedrole },
            }),
        }),
        getAllversions: builder.query({
            query: ({ editorId }) => {
                return `/doc/versions/${editorId}`;
            },
        }),
        getContributors: builder.query({
            query: ({ editorId }) => {
                console.log(editorId);
                return `/doc/${editorId}/contributors`;
            },
        }),
        addPeople: builder.mutation({
            query: ({ documentId, emails, role }) => ({
                url: '/doc/add-people',
                method: 'POST',
                body: { documentId, emails, role },
            }),
        }),
        uploadDocumentImage: builder.mutation({
            query: ({ documentId, file }) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/doc/${documentId}/upload`,
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        generatePdf: builder.mutation({
            query: (htmlContent) => ({
                url: '/doc/generate-pdf',
                method: 'POST',
                body: { htmlContent },
                responseHandler: (response) => response.blob(),
            }),
            // Add this onQueryStarted property to prevent caching the data
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // You could handle the download directly here,
                    // or just ensure the promise resolves
                } catch (error) {
                    // Handle any errors
                    console.error('Download failed:', error);
                }
            },
            // Set keepUnusedDataFor to 0 to prevent RTK from caching the result
            keepUnusedDataFor: 0,
        }),
        changeDocName: builder.mutation({
            query: ({ documentId, name }) => ({
                url: '/doc/doc-rename',
                method: 'POST',
                body: { documentId, name },
            }),
        }),
        getUserDocuments: builder.query({
            query: (userId) => {
                return `/doc/user-documents/${userId}`;
            },
        }),
    }),
});

export const {
    useSaveVersionMutation,
    useGetVersionQuery,
    useCreateDocumentMutation,
    useGetAllversionsQuery,
    useGetContributorsQuery,
    useAddPeopleMutation,
    useUploadDocumentImageMutation,
    useGeneratePdfMutation,
    useGetDocumentQuery,
    useUpdateDocumentMutation,
    useChangeDocNameMutation,
    useGetUserDocumentsQuery,
} = docApi;
