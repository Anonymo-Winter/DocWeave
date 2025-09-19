import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: 'Untitled Document',
        },
        template: {
            type: String,
            enum: ['blank', 'resume', 'report', 'letter'],
            default: 'blank',
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        collaborators: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['editor', 'viewer'],
                    default: 'viewer',
                },
            },
        ],
        visibility: {
            type: String,
            enum: ['restricted', 'public'],
            default: 'restricted',
        },
        userColors: {
            type: Map,
            of: String, // userId -> colorHex
            default: {},
        },
    },
    { timestamps: true },
);

// indexes for performance
documentSchema.index({ ownerId: 1 });
documentSchema.index({ 'collaborators.userId': 1 });
documentSchema.index({ visibility: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
