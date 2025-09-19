import axios from 'axios';

const hostname = window.location.hostname;
const backendUrl = hostname === 'localhost' ? 'http://localhost:5000/api' : `${import.meta.env.VITE_BACKEND_URL}/api`;

export const uploadDocumentImageWithProgress = async (documentId, file, onProgress, signal) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await axios.post(`${backendUrl}/doc/${documentId}/upload`, formData, {
            withCredentials: true,
            signal, // 👈 supports abortController
            onUploadProgress: (event) => {
                if (event.total && onProgress) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    onProgress({ progress: percent });
                }
            },
        });

        // Expecting your API to return the URL string
        return res.data?.url || res.data;
    } catch (err) {
        console.error('Image upload failed:', err);
        throw err;
    }
};
