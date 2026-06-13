import axios from 'axios';
import { API_URL as backendUrl } from '../config';

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
