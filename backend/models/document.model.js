import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
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
        editors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        viewers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        visibility: {
            type: String,
            enum: ['private', 'shared', 'public'],
            default: 'private',
        },
        userColors: {
            type: Map,
            of: String, // Map<userId, colorHex>
            default: {},
        },
    },
    { timestamps: true },
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
