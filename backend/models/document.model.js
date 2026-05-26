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
            enum: ['blank-doc', 'sketch-board'],
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
            enum: ['restricted', 'anyone-with-link:r', 'anyone-with-link:w', 'anyone-in-org:r', 'anyone-in-org:w'],
            default: 'restricted',
        },
        userColors: { type: Map, of: String, default: () => ({}) },
        contentPreview: { type: String, default: '' },
        sharing: {
            editorsCanManageAccess: { type: Boolean, default: false },
            editorGrantableRoles: {
                type: [String],
                enum: ['viewer', 'editor'],
                default: ['viewer'],
            },
            editorsCanChangeVisibility: { type: Boolean, default: false },
            allowedVisibility: {
                type: [String],
                enum: ['restricted', 'anyone-with-link:r', 'anyone-with-link:w', 'anyone-in-org:r', 'anyone-in-org:w'],
                default: [
                    'restricted',
                    'anyone-with-link:r',
                    'anyone-with-link:w',
                    'anyone-in-org:r',
                    'anyone-in-org:w',
                ],
            },
            lockContent: { type: Boolean, default: false },
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
