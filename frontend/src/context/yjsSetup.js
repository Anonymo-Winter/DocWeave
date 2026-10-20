// yjsSetup.js
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness.js';
import { IndexeddbPersistence } from 'y-indexeddb';

// Keep a cache so each docId gets exactly one Y.Doc per tab
const docMap = new Map();

/**
 * Get or create Yjs objects for a specific document.
 * @param {string} docId
 */
export function getYjsForDoc(docId) {
    if (!docId) {
        return null;
    }

    if (!docMap.has(docId)) {
        const ydoc = new Y.Doc();
        const awareness = new Awareness(ydoc);
        const indexeddbProvider = new IndexeddbPersistence(`doc-${docId}`, ydoc);

        docMap.set(docId, { ydoc, awareness, indexeddbProvider });
    }

    return docMap.get(docId);
}

export function whenIndexeddbSynced(indexeddbProvider) {
    if (!indexeddbProvider) return Promise.resolve();

    // If already synced, resolve immediately
    if (indexeddbProvider.synced) {
        return Promise.resolve();
    }

    // Otherwise wait for the event
    return new Promise((resolve) => {
        indexeddbProvider.once('synced', resolve);
    });
}

export function getCriticalEditorError(error) {
    if (!error) return null;

    const status = error?.status;

    // 🔴 Document not found
    if (status === 404) {
        return {
            code: 'DOC_NOT_FOUND',
            status: 404,
            message: 'The document you are looking for does not exist.',
        };
    }

    // 🔴 Forbidden / no access
    if (status === 403) {
        return {
            code: 'NO_ACCESS',
            status: 403,
            message: 'You do not have permission to access this document.',
        };
    }

    // 🔴 Server-side fatal errors
    if (status >= 500) {
        return {
            code: 'SERVER_ERROR',
            status,
            message: 'The server failed while loading this document.',
        };
    }

    // 🔴 Corrupt version update
    if (error?.data?.code === 'INVALID_VERSION') {
        return {
            code: 'INVALID_VERSION',
            status: 500,
            message: 'This document version is corrupted and cannot be loaded.',
        };
    }

    return null; // not critical
}
