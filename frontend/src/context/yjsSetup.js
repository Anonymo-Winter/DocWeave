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
        throw new Error('getYjsForDoc: docId is required');
    }

    if (!docMap.has(docId)) {
        const ydoc = new Y.Doc();
        const awareness = new Awareness(ydoc);
        const indexeddbProvider = new IndexeddbPersistence(`doc-${docId}`, ydoc);

        docMap.set(docId, { ydoc, awareness, indexeddbProvider });
    }

    return docMap.get(docId);
}
