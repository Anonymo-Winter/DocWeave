import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            requireed: [true, "Name is required"],
            trim: true,
        },
        content: {
            type: String,
        },
        editorId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        viewer: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastModified: {
            type: Date,
            default: Date.now,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
