import Version from '../models/version.model.js'; // Your Version schema
import Document from '../models/document.model.js'; // Optional: for validating docId
import User from '../models/user.model.js'; // Optional: for validating author
import mongoose, { version } from 'mongoose';
import * as Y from 'yjs';
import fs from 'node:fs';
import cloudinary from '../util/cloudinary.js';

export const saveVersion = async (req, res) => {
    try {
        const {
            documentId,
            description,
            update,
            author,
            name,
            wordCount,
            collaborators,
            isStarred = false,
            isNamed = !!name,
        } = req.body;

        // ✅ Validation
        if (!documentId || !update || !author || !author.data || !author.color || !Array.isArray(collaborators)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID format' });
        }

        try {
            const decoded = Buffer.from(update, 'base64');
            Y.decodeUpdate(decoded); // Will throw if corrupted
        } catch (err) {
            return res.status(400).json({ message: 'Invalid Yjs update data', error: err.message });
        }

        // Optional: Check if document exists
        const documentExists = await Document.exists({ _id: documentId });
        if (!documentExists) {
            return res.status(404).json({ message: 'Document not found' });
        }
        const version = new Version({
            documentId,
            update: Buffer.from(update, 'base64'), // Store as Buffer in MongoDB
            name,
            description,
            author,
            wordCount,
            collaborators,
            isStarred,
            isNamed,
        });

        await version.save();

        return res.status(201).json({
            message: 'Version saved successfully',
            success: true,
            versionId: version._id,
        });
    } catch (error) {
        console.error('Error saving version:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVersion = async (req, res) => {
    try {
        const { documentId } = req.params;

        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(404).json({ message: 'Invalid or missing document ID' });
        }

        const documentExists = await Document.exists({ _id: documentId });
        if (!documentExists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const latestVersion = await Version.findOne({ documentId })
            .sort({ createdAt: -1 })
            .select('update name createdAt author wordCount');

        // ✅ Handle case where no version exists
        if (!latestVersion) {
            return res.status(200).json({
                success: true,
                message: 'No version found for this document',
                version: {
                    documentId,
                    update: [],
                    name: 'current version',
                    createdAt: null,
                },
            });
        }

        // ✅ Ensure update is properly converted to base64
        let updateBase64;
        try {
            if (Buffer.isBuffer(latestVersion.update)) {
                updateBase64 = latestVersion.update.toString('base64');
            } else {
                // Handle case where update might be stored as string
                updateBase64 = Buffer.from(latestVersion.update).toString('base64');
            }

            // Validate that we can decode it
            const decoded = Buffer.from(updateBase64, 'base64');
            Y.decodeUpdate(decoded);
        } catch (err) {
            console.error('Error processing version update:', err);
            return res.status(500).json({
                success: false,
                message: 'Version data is corrupted',
                error: err.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Latest version fetched successfully',
            version: {
                ...latestVersion.toObject(),
                update: updateBase64,
            },
        });
    } catch (error) {
        console.error('Error fetching version:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch version',
            error: error.message,
        });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { templateName = 'blank' } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const document = await Document.create({
            template: templateName,
            ownerId: userId,
            collaborators: [
                {
                    userId,
                    role: 'editor',
                },
            ],
        });
        userExists.recentDocs.unshift({
            document: document._id,
            accessed: new Date(),
        });
        userExists.recentDocs = userExists.recentDocs.slice(0, 5);
        await userExists.save();

        res.status(201).json({
            success: true,
            message: 'Document created successfully',
            documentId: document._id,
        });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Failed to create document' });
    }
};

// import { contributorsMap, roomUsers } from '../socket.js';

export const getAllVersions = async (req, res) => {
    const { editorId } = req.params;
    if (!editorId || !mongoose.Types.ObjectId.isValid(editorId)) {
        return res.status(400).json({ message: 'Invalid or missing editor ID' });
    }
    try {
        const versions = await Version.find({ documentId: editorId })
            .sort({ createdAt: -1 })
            .populate('author.data')
            .populate('collaborators.user')
            .exec();
        return res.status(200).json({ success: true, message: 'Versions fetched successfully', versions });
    } catch (error) {
        console.error('Error fetching all versions:', error);
        return res.status(500).json({ message: 'Failed to fetch versions', error: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.userId;

        const doc = await Document.findById(documentId);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // permission check → only owner can delete
        if (doc.ownerId.toString() !== userId) {
            return res.status(403).json({ message: 'Only owner can delete this document' });
        }

        // delete versions first
        await Version.deleteMany({ documentId });

        // delete document itself
        await Document.findByIdAndDelete(documentId);

        res.json({ success: true, message: 'Document and versions deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
};

export const addPeople = async (req, res) => {
    const { documentId, emails, role } = req.body;

    try {
        // Validate request
        if (!documentId || !Array.isArray(emails) || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        // Find document with owner and collaborators populated
        const document = await Document.findById(documentId)
            .populate('ownerId')
            .populate('collaborators.userId')
            .exec();

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Block collaborator additions if doc is public
        if (document.visibility === 'public') {
            return res.status(400).json({ message: 'Cannot add collaborators to a public document' });
        }

        // Filter out already added emails (owner + collaborators)
        const emailsNotAlreadyAdded = emails.filter((email) => {
            if (document.ownerId.email === email) return false;

            return !document.collaborators.some((collab) => collab.userId?.email === email);
        });

        if (emailsNotAlreadyAdded.length === 0) {
            return res.status(200).json({ success: true, message: 'No new users to add' });
        }

        // Fetch users by email
        const users = await User.find({ email: { $in: emailsNotAlreadyAdded } });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No matching users found' });
        }

        // Push users into collaborators (deduplicated)
        users.forEach((user) => {
            if (!document.collaborators.some((c) => c.userId._id.toString() === user._id.toString())) {
                document.collaborators.push({ userId: user._id, role });
            }
        });

        await document.save();

        // Return updated doc with collaborators populated
        const updatedDoc = await Document.findById(documentId)
            .populate('ownerId')
            .populate('collaborators.userId')
            .exec();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding people:', error);
        return res.status(500).json({ message: 'Failed to add people', error: error.message });
    }
};

export const fetchDocShareableData = async (req, res) => {
    const { editorId } = req.params;

    if (!editorId || !mongoose.Types.ObjectId.isValid(editorId)) {
        return res.status(400).json({ message: 'Invalid or missing editor ID' });
    }

    try {
        const document = await Document.findById(editorId)
            .populate('ownerId', 'name email')
            .populate('collaborators.userId', 'name email')
            .exec();

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // ✅ Send the populated doc to frontend
        return res.status(200).json({
            success: true,
            message: 'Document fetched meta data successfully',
            document: document,
        });
    } catch (error) {
        console.error('Error fetching document meta data:', error);
        return res.status(500).json({
            message: 'Failed to fetch document meta data.',
            error: error.message,
        });
    }
};

export const uploadImageInEditor = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'collab_docs',
        });

        // Delete temp file after upload
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'File uploaded successfully',
            url: result.secure_url,
            documentId: req.params.documentId,
        });
    } catch (err) {
        console.error('Upload failed:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};

// export const getContributors = async (req, res) => {
//     const { editorId: roomId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(roomId)) {
//         return res.status(400).json({ error: 'Invalid document ID' });
//     }
//     const contributorIds = contributorsMap.get(roomId);
//     if (!contributorIds || contributorIds.size === 0) {
//         return res.json({ contributors: [] });
//     }
//     // Pull role/color from roomUsers (if user is still online), or set defaults
//     const usersInRoom = roomUsers.get(roomId) || new Map();
//     const contributors = Array.from(contributorIds).map((userId) => {
//         const entry = usersInRoom.get(userId) || {};
//         return {
//             _id: userId,
//             role: entry.user?.role || 'editor',
//             color: entry.user?.color || '#999999',
//         };
//     });
//     return res.json({ contributors });
// };
