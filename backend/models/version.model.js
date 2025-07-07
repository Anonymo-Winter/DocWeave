import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        update: {
            type: Buffer, // Yjs encoded snapshot
            required: true,
        },
        author: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            name: String,
        },
        name: {
            type: String, // Optional name: “Draft v2”
        },
        changes: {
            type: String, // Human-readable diff or summary
        },
        wordCount: {
            type: Number,
        },
        collaborators: [
            {
                name: String,
                role: {
                    type: String,
                    enum: ['Owner', 'Editor', 'Viewer'],
                },
            },
        ],
        isStarred: {
            type: Boolean,
            default: false,
        },
        isNamed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }, // Includes createdAt
);

versionSchema.index({ documentId: 1, createdAt: -1 });

const Version = mongoose.model('Version', versionSchema);
export default Version;
