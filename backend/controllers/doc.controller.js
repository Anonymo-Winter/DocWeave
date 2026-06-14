import Version from '../models/version.model.js'; // Your Version schema
import DocumentState from '../models/documentState.model.js'; // Rolling autosave blob (latest live state)
import Document from '../models/document.model.js'; // Optional: for validating docId
import User from '../models/user.model.js'; // Optional: for validating author
import mongoose, { version } from 'mongoose';
import * as Y from 'yjs';
import fs from 'node:fs';
import cloudinary from '../util/cloudinary.js';
import puppeteer from 'puppeteer';
import { sendInvite, sendOwnershipTransfer } from '../util/sendEmail.js';

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
        res.status(500).json({ message: 'Could not save this version. Please try again.' });
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

        // Load priority: rolling autosave blob (always the freshest full state)
        // → else latest manual version → else empty doc. The autosave blob is
        // updated on every edit and flushed when the room empties, so when it
        // exists it is the most recent representation of the document.
        const liveState = await DocumentState.findOne({ documentId }).select('state updatedAt');
        if (liveState?.state) {
            try {
                const updateBase64 = Buffer.from(liveState.state).toString('base64');
                Y.decodeUpdate(Buffer.from(updateBase64, 'base64')); // validate
                return res.status(200).json({
                    success: true,
                    message: 'Latest autosaved state fetched successfully',
                    version: {
                        documentId,
                        update: updateBase64,
                        name: 'autosave',
                        source: 'autosave',
                        createdAt: liveState.updatedAt,
                    },
                });
            } catch (err) {
                // Corrupt blob: fall through to the manual version history.
                console.error('Autosave blob corrupted, falling back to versions:', err);
            }
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
        res.status(500).json({ message: 'Could not create the document. Please try again.' });
    }
};

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

export const addPeople = async (req, res) => {
    const { documentId, emails, role } = req.body;
    const actorId = req.userId;

    try {
        if (!documentId || !Array.isArray(emails) || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        const document = await Document.findById(documentId)
            .populate('ownerId')
            .populate('collaborators.userId')
            .exec();

        if (!document) return res.status(404).json({ message: 'Document not found' });

        // ✅ Permission check
        const effective = await resolveUserRole({ userId: actorId, docId: documentId });
        if (!effective) return res.status(403).json({ message: 'ACCESS_DENIED' });

        const isOwner = effective === 'OWNER';
        const isEditor = effective === 'EDITOR';

        if (!isOwner) {
            // editors need explicit permission
            if (!isEditor || !document.sharing?.editorsCanManageAccess) {
                return res.status(403).json({ message: 'Not allowed to manage access' });
            }

            // editors can only grant allowed roles
            const grantable = document.sharing?.editorGrantableRoles ?? ['viewer'];
            if (!grantable.includes(role)) {
                return res.status(403).json({ message: 'Not allowed to grant this role' });
            }
        }

        // Filter out already added emails (owner + collaborators)
        const emailsNotAlreadyAdded = emails.filter((email) => {
            if (document.ownerId?.email === email) return false;
            return !document.collaborators.some((c) => c.userId?.email === email);
        });

        if (emailsNotAlreadyAdded.length === 0) {
            return res.status(200).json({ success: true, message: 'No new users to add' });
        }

        const users = await User.find({ email: { $in: emailsNotAlreadyAdded } });
        if (users.length === 0) return res.status(404).json({ message: 'No matching users found' });

        const newlyAddedUsers = [];
        for (const user of users) {
            const already = document.collaborators.some((c) => c.userId?._id.toString() === user._id.toString());
            if (!already) {
                document.collaborators.push({ userId: user._id, role });
                newlyAddedUsers.push({ user, role });
            }
        }

        await document.save();

        // Respond as soon as the collaborators are persisted. Invite emails are
        // best-effort and must not gate (or hang) the request — a slow/unreachable
        // mail server would otherwise leave the client spinner stuck forever.
        const fromUser = await User.findById(actorId).select('name email').exec();
        res.status(200).json({ success: true });

        // Fire-and-forget the invite emails after responding.
        for (const { user, role: inviteRole } of newlyAddedUsers) {
            if (user.email) {
                sendInvite(
                    { username: user.name, email: user.email },
                    { username: fromUser.name, email: fromUser.email },
                    { documentId, name: document.title },
                    inviteRole,
                ).catch((err) => console.error('Failed to send invite to', user.email, err.message));
            }
        }
        return;
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
            .populate('ownerId', 'name email image')
            .populate('collaborators.userId', 'name email image')
            .exec();

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const role = await resolveUserRole({ userId: req.userId, docId: editorId });
        return res.status(200).json({
            success: true,
            message: 'Document data fetched successfully',
            document: document,
            permission: role,
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

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Puppeteer Error:', error);
        res.status(500).json({ message: 'Could not generate the PDF. Please try again.' });
    }
};

// controller file
import { emitToUserInRoom, setRoleForUserSockets, kickUserFromRoom } from '../realtime.js';

export const updateDocument = async (req, res) => {
    const { visibility, userswithupdatedrole, sharing } = req.body;
    const { editorId } = req.params;
    const actorId = req.userId;

    try {
        const document = await Document.findById(editorId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        const effective = await resolveUserRole({ userId: actorId, docId: editorId });
        if (!effective) return res.status(403).json({ message: 'ACCESS_DENIED' });

        const isOwner = effective === 'OWNER';
        const isEditor = effective === 'EDITOR';

        // Snapshot collaborators BEFORE changes
        const before = new Map(document.collaborators.map((c) => [c.userId.toString(), c.role]));
        const beforeVisibility = document.visibility;

        // ====== Sharing updates (advanced settings) ======
        if (sharing) {
            // 🔒 recommended: only OWNER can change sharing rules
            if (isOwner) {
                document.sharing.editorsCanManageAccess = sharing.editorsCanManageAccess;
                document.sharing.editorsCanChangeVisibility = sharing.editorsCanChangeVisibility;
                document.sharing.editorGrantableRoles = sharing.editorGrantableRoles;
                document.sharing.allowedVisibility = sharing.allowedVisibility;
                if (typeof sharing.lockContent === 'boolean') document.sharing.lockContent = sharing.lockContent;
            } else {
                // apply only allowed fields
                if (typeof sharing.editorsCanManageAccess === 'boolean')
                    document.sharing.editorsCanManageAccess = sharing.editorsCanManageAccess;

                if (typeof sharing.editorsCanChangeVisibility === 'boolean')
                    document.sharing.editorsCanChangeVisibility = sharing.editorsCanChangeVisibility;

                if (Array.isArray(sharing.editorGrantableRoles))
                    document.sharing.editorGrantableRoles = sharing.editorGrantableRoles;

                if (Array.isArray(sharing.allowedVisibility))
                    document.sharing.allowedVisibility = sharing.allowedVisibility;
            }
        }

        // ====== Visibility updates ======
        if (typeof visibility === 'string') {
            if (!isOwner) {
                if (!isEditor || !document.sharing?.editorsCanChangeVisibility) {
                    return res.status(403).json({ message: 'Not allowed to change visibility' });
                }

                // editors cannot set a visibility mode that is not allowed
                const allowed = document.sharing?.allowedVisibility ?? [];
                if (visibility !== 'restricted' && !allowed.includes(visibility)) {
                    return res.status(403).json({ message: 'Visibility mode not allowed' });
                }
            }

            // OWNER should also respect allowedVisibility? (optional)
            // If you want owner restricted by allowedVisibility, enforce here too.
            document.visibility = visibility;
        }

        // ====== Collaborator role changes/removals ======
        const changedUserIds = [];
        let transferredOwnerId = null;

        if (Array.isArray(userswithupdatedrole) && userswithupdatedrole.length > 0) {
            if (!isOwner) {
                if (!isEditor || !document.sharing?.editorsCanManageAccess) {
                    return res.status(403).json({ message: 'Not allowed to manage access' });
                }
            }

            // ====== Ownership transfer (owner-only, at most one) ======
            const ownerEntries = userswithupdatedrole.filter((u) => u.role === 'owner');
            if (ownerEntries.length > 1) {
                return res.status(400).json({ message: 'You can only transfer ownership to one person at a time.' });
            }
            const ownerTransfer = ownerEntries[0];
            if (ownerTransfer) {
                if (!isOwner) {
                    return res.status(403).json({ message: 'Only the owner can transfer ownership' });
                }
                const newOwnerId = ownerTransfer.id;
                const prevOwnerId = document.ownerId.toString();

                // The new owner must already be a collaborator on this document.
                if (!newOwnerId || !before.has(newOwnerId)) {
                    return res.status(400).json({ message: 'New owner must be an existing collaborator' });
                }

                if (newOwnerId !== prevOwnerId) {
                    // The owner is always kept in `collaborators` too (as editor) — the same
                    // way createDocument seeds it — so the owner lives in BOTH ownerId and the
                    // collaborators array. The previous owner simply remains an editor; the new
                    // owner keeps their collaborator entry and gains ownership via ownerId.
                    const ensureCollaborator = (uid) => {
                        const existing = document.collaborators.find((c) => c.userId.toString() === uid);
                        if (existing) existing.role = 'editor';
                        else document.collaborators.push({ userId: uid, role: 'editor' });
                    };
                    ensureCollaborator(prevOwnerId);
                    ensureCollaborator(newOwnerId);

                    document.ownerId = newOwnerId;
                    changedUserIds.push(prevOwnerId, newOwnerId);
                    transferredOwnerId = newOwnerId;
                }
            }

            const grantable = isOwner ? ['viewer', 'editor'] : (document.sharing?.editorGrantableRoles ?? ['viewer']);

            for (const u of userswithupdatedrole) {
                // Ownership transfer is handled above.
                if (u.role === 'owner') continue;

                const prevRole = before.get(u.id); // 'editor'|'viewer'|undefined
                const isTargetOwner = document.ownerId.toString() === u.id;

                // never allow removing/changing owner through this endpoint
                if (isTargetOwner) continue;

                if (u.role === 'remove') {
                    document.collaborators = document.collaborators.filter((c) => c.userId.toString() !== u.id);
                    if ((prevRole ?? null) !== null) changedUserIds.push(u.id);
                    continue;
                }

                // only allow editor/viewer assignments
                if (u.role !== 'editor' && u.role !== 'viewer') continue;

                // editors can only grant roles in editorGrantableRoles
                if (!grantable.includes(u.role)) {
                    return res.status(403).json({ message: 'Not allowed to grant this role' });
                }

                const collab = document.collaborators.find((c) => c.userId.toString() === u.id);
                if (collab) {
                    collab.role = u.role;
                }

                if ((prevRole ?? null) !== u.role) changedUserIds.push(u.id);
            }
        }

        await document.save();

        // ✅ Realtime enforcement (your existing logic)
        for (const userId of changedUserIds) {
            const nextEffective = await resolveUserRole({ userId, docId: editorId });

            if (!nextEffective) {
                setRoleForUserSockets(editorId, userId, null);
                emitToUserInRoom(editorId, userId, 'error', 'ACCESS_DENIED');
                kickUserFromRoom(editorId, userId);
            } else {
                setRoleForUserSockets(editorId, userId, nextEffective);
                emitToUserInRoom(editorId, userId, 'access-updated', {
                    docId: editorId,
                    role: nextEffective,
                    message: `Your access is now ${nextEffective}.`,
                });
            }
        }

        // Optional: if visibility changed, you can re-check all online users in room
        // (because it may change effective access for link/org users).

        // Notify the new owner (best-effort — never blocks the response).
        if (transferredOwnerId) {
            try {
                const [newOwner, actor] = await Promise.all([
                    User.findById(transferredOwnerId).select('name email'),
                    User.findById(actorId).select('name'),
                ]);
                if (newOwner?.email) {
                    sendOwnershipTransfer(
                        { username: newOwner.name, email: newOwner.email },
                        { username: actor?.name },
                        { documentId: editorId, name: document.title },
                    );
                }
            } catch (mailErr) {
                console.error('ownership transfer email failed:', mailErr.message);
            }
        }

        return res.status(200).json({ success: true, updatedDocument: document });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Could not update the document. Please try again.' });
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
    } catch (error) {
        console.error('Error renaming document:', error);
        res.status(500).json({ message: 'Could not rename the document. Please try again.' });
    }
};

export const resolveUserRole = async ({ userId, docId }) => {
    const doc = await Document.findById(docId).lean();
    if (!doc) return null;

    // Owner always wins
    if (doc.ownerId.toString() === userId?.toString()) return 'OWNER';

    // Lock content -> everyone else is VIEWER
    if (doc?.sharing?.lockContent) return 'VIEWER';

    // Collaborator explicit role
    const collaborator = doc.collaborators?.find((c) => c.userId.toString() === userId?.toString());
    if (collaborator) return collaborator.role === 'editor' ? 'EDITOR' : 'VIEWER';

    // Non-collaborators: enforce allowed visibility
    const allowedVisibility = doc?.sharing?.allowedVisibility ?? [
        'restricted',
        'anyone-with-link:r',
        'anyone-with-link:w',
        'anyone-in-org:r',
        'anyone-in-org:w',
    ];

    // If doc visibility isn't allowed by owner settings, treat as restricted
    if (doc.visibility !== 'restricted' && !allowedVisibility.includes(doc.visibility)) {
        return null;
    }

    switch (doc.visibility) {
        case 'anyone-with-link:r':
            return 'VIEWER';
        case 'anyone-with-link:w':
            return 'EDITOR';
        case 'anyone-in-org:r':
            return userId ? 'VIEWER' : null;
        case 'anyone-in-org:w':
            return userId ? 'EDITOR' : null;
        default:
            return null;
    }
};

export const getUserDocuments = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await User.findById(userId).select('recentDocs').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1️⃣ Fetch all accessible documents
        const documents = await Document.find({
            $or: [
                { ownerId: userId },
                { 'collaborators.userId': userId },
                {
                    visibility: {
                        $in: ['anyone-with-link:r', 'anyone-with-link:w', 'anyone-in-org:r', 'anyone-in-org:w'],
                    },
                },
            ],
        })
            .select('title ownerId collaborators visibility updatedAt template contentPreview')
            .lean();

        // 2️⃣ Build recentDocs lookup
        const recentMap = new Map(user.recentDocs.map((r) => [r.document.toString(), r]));

        // 3️⃣ Normalize for dashboard
        const userDocuments = await Promise.all(
            documents.map(async (doc) => {
                const recent = recentMap.get(doc._id.toString());
                const isOwner = doc.ownerId.toString() === userId;
                const isCollaborator = doc.collaborators.some((c) => c.userId.toString() === userId);

                return {
                    id: doc._id,
                    title: doc.title,
                    lastModified: recent?.accessed || doc.updatedAt,
                    collaborators: doc.collaborators.length,
                    starred: recent?.starred || false,
                    contentPreview: doc.contentPreview || '',
                    ownership: isOwner ? 'owned' : isCollaborator ? 'collaborator' : 'view',
                    permission: await resolveUserRole({ userId, docId: doc._id }),
                    template: doc.template,
                    visibility: doc.visibility || 'restricted',
                };
            }),
        );

        res.json({ success: true, userDocuments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not load your documents. Please try again.' });
    }
};

export const deleteDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID' });
    }

    try {
        const doc = await Document.findById(documentId).select('ownerId').lean();
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (doc.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete this document' });
        }

        await Promise.all([
            Version.deleteMany({ documentId }),
            Document.deleteOne({ _id: documentId }),
            User.updateMany({ 'recentDocs.document': documentId }, { $pull: { recentDocs: { document: documentId } } }),
        ]);

        return res.json({ success: true, documentId });
    } catch (error) {
        console.error('deleteDocument error:', error);
        res.status(500).json({ message: 'Could not delete the document. Please try again.' });
    }
};

export const toggleStarDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const entry = user.recentDocs.find((r) => r.document.toString() === documentId);

        // If document not in recentDocs → add it
        if (!entry) {
            user.recentDocs.unshift({
                document: documentId,
                starred: true,
                accessed: new Date(),
            });
        } else {
            entry.starred = !entry.starred;
            entry.accessed = new Date();
        }

        await user.save();

        return res.json({
            success: true,
            starred: entry ? entry.starred : true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not update the star. Please try again.' });
    }
};
