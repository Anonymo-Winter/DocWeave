import mongoose from 'mongoose';

/**
 * Rolling autosave blob — exactly ONE record per document.
 *
 * Unlike `Version` (append-only history of intentional, named restore points),
 * this holds the full Yjs document state and is OVERWRITTEN on every autosave.
 * It is the crash-safety net: "the latest work is never lost", but it keeps no
 * history of its own. The server is the single writer (see socket.js).
 */
const documentStateSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
            unique: true, // one rolling blob per document
            index: true,
        },
        // Full document state from Y.encodeStateAsUpdate(doc), stored as a Buffer.
        state: {
            type: Buffer,
            required: true,
        },
    },
    { timestamps: true }, // updatedAt == "last autosaved at"
);

const DocumentState = mongoose.model('DocumentState', documentStateSchema);
export default DocumentState;
