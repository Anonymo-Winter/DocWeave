import Version from '../models/version.model.js'; // Your Version schema
import Document from '../models/document.model.js'; // Optional: for validating docId
import User from '../models/user.model.js'; // Optional: for validating author
import mongoose, { version } from 'mongoose';
import * as Y from 'yjs';

export const saveVersion = async (req, res) => {
    try {
        const {
            documentId,
            update,
            author,
            name,
            changes,
            wordCount,
            collaborators,
            isStarred = false,
            isNamed = !!name,
        } = req.body;

        // ✅ Validation
        if (!documentId || !update || !author || !author._id || !author.name || !Array.isArray(collaborators)) {
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

        // ✅ Create version document - store as Buffer, not convert from base64
        const version = new Version({
            documentId,
            update: Buffer.from(update, 'base64'), // Store as Buffer in MongoDB
            author,
            name,
            changes,
            wordCount,
            collaborators,
            isStarred,
            isNamed,
        });

        await version.save();

        return res.status(201).json({
            message: 'Version saved successfully',
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
            return res.status(400).json({ message: 'Invalid or missing document ID' });
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
            editors: [userId],
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
