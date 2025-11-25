import Version from '../models/version.model.js'; // Your Version schema
import Document from '../models/document.model.js'; // Optional: for validating docId
import User from '../models/user.model.js'; // Optional: for validating author
import mongoose, { version } from 'mongoose';
import * as Y from 'yjs';
import fs from 'node:fs';
import cloudinary from '../util/cloudinary.js';
import puppeteer from 'puppeteer';
import { sendInvite } from '../util/sendEmail.js';

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
    const userId = req.userId;

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

        const newlyAddedUsers = [];

        users.forEach((user) => {
            if (!document.collaborators.some((c) => c.userId._id.toString() === user._id.toString())) {
                document.collaborators.push({ userId: user._id, role });
                newlyAddedUsers.push({ user, role });
            }
        });

        await document.save();

        const fromuser = await User.findById(userId).select('name email').exec();
        console.log(fromuser);

        for (const { user, role } of newlyAddedUsers) {
            if (user.email) {
                // IMPORTANT: complete this logic
                await sendInvite(
                    { username: user.name, email: user.email },
                    { username: fromuser.name, email: fromuser.email },
                    { documentId: documentId, name: document.title },
                    role,
                );
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding people:', error);
        return res.status(500).json({ message: 'Failed to add people', error: error.message });
    }
};

export const getDocument = async (req, res) => {
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
            message: 'Document data fetched successfully',
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

export const generatePDF = async (req, res) => {
    try {
        const { htmlContent } = req.body;

        const browser = await puppeteer.launch({ headless: false }); // Use headless: false for debugging!
        const page = await browser.newPage();

        // Listen for console messages from the browser
        page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));

        // Log the received HTML to inspect it
        console.log('Received HTML:', htmlContent);

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Puppeteer Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
export const updateDocument = async (req, res) => {
    const { visibility, userswithupdatedrole } = req.body;
    const { editorId } = req.params;

    try {
        if (!editorId || !mongoose.Types.ObjectId.isValid(editorId)) {
            return res.status(400).json({ message: 'Invalid or missing editor ID' });
        }

        const document = await Document.findById(editorId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Update visibility if provided
        if (visibility) document.visibility = visibility;

        // 🔥 Update collaborator roles if provided
        if (Array.isArray(userswithupdatedrole) && userswithupdatedrole.length > 0) {
            userswithupdatedrole.forEach((userUpdate) => {
                const collab = document.collaborators.find((c) => c.userId.toString() === userUpdate.id);
                if (collab) {
                    collab.role = userUpdate.role;
                }
            });
        }

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            updatedDocument: document,
        });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
};

export const changeDocName = async (req, res) => {
    const { documentId, name } = req.body;

    try {
        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid or missing document ID' });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (name) {
            document.title = name;
        } else {
            return res.status(400).json({ message: 'Missing document name' });
        }

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document renamed successfully',
            updatedDocument: document,
        });
        console.log('changed name : ', name);
    } catch (error) {
        console.error('Error renaming document:', error);
        res.status(500).json({ error: 'Failed to rename document' });
    }
};
