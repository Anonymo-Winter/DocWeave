import Document from '../models/document.model.js'; // Optional: for validating docId
import User from '../models/user.model.js';
import Version from '../models/version.model.js';
import mongoose, { version } from 'mongoose';

export const updateVersionDetails = async (req, res) => {
    const { title, description, versionId } = req.body;
    // if (!title || !description) return res.status(400).json({ error: 'Missing required fields' });
    if (!versionId || !mongoose.Types.ObjectId.isValid(versionId)) {
        return res.status(400).json({ success: false, message: 'Invalid version ID' });
    }
    try {
        const version = await Version.findById(versionId);
        if (!version) {
            return res.status(400).json({ success: false, message: 'Version not found' });
        }
        version.title = title;
        version.description = description;
        await version.save();
        return res.status(200).json({ success: true, message: 'Version updated successfully' });
    } catch (error) {
        console.error('Error saving version:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ success: true });
};

export const deleteVersion = async (req, res) => {
    const { documentId } = req.params;
    const { versionId } = req.body;
    const user = req.userId;
    try {
        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId))
            return res.status(400).json({ message: 'Invalid document ID' });
        if (!versionId || !mongoose.Types.ObjectId.isValid(versionId))
            return res.status(400).json({ message: 'Invalid version ID' });
        if (!user) {
            return res.status(403).json({ message: 'User not authenticated' });
        }
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const haveAccess = document.collaborators.some((collaborator) => collaborator.userId.toString() === user);
        if (!haveAccess) {
            return res.status(403).json({ message: 'You do not have access to remove versions from this document' });
        }
        const version = await Version.findByIdAndDelete(versionId);
        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting version:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
