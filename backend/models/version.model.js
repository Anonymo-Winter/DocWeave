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
            type: Buffer,
            required: true,
        },
        author: {
            type: new mongoose.Schema(
                {
                    data: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                    color: { type: String },
                },
                { _id: false },
            ),
            required: true,
        },
        name: {
            type: String,
            default: () =>
                new Date().toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
        },
        wordCount: {
            type: Number,
            default: 0,
        },
        collaborators: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['owner', 'editor', 'viewer'],
                },
                color: String,
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
        source: {
            type: String,
            enum: ['manual', 'autosave', 'recovery'],
            default: 'manual',
        },
    },
    { timestamps: true },
);

versionSchema.index({ documentId: 1, createdAt: -1 });

const Version = mongoose.model('Version', versionSchema);
export default Version;
