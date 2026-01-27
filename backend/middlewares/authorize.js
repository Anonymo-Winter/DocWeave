import { PERMISSIONS } from '../util/permissions.js';
import { resolveUserRole } from '../controllers/doc.controller.js';

export const authorize = (action) => {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            const docId = req.params.documentId || req.params.editorId || req.body.documentId;

            if (!docId) {
                return res.status(400).json({ message: 'Document ID missing' });
            }

            const role = await resolveUserRole({ userId, docId });

            if (!role) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const allowedRoles = PERMISSIONS[action];
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    message: `Permission denied for ${action}`,
                    role,
                });
            }

            // Attach role to request (VERY useful)
            req.userRole = role;
            next();
        } catch (err) {
            console.error('Authorization error:', err);
            res.status(500).json({ message: 'Authorization failed' });
        }
    };
};
