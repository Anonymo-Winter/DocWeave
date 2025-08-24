import express from 'express';
import { verifyToken } from '../middlewares/verifytoken.js';
import {
    getVersion,
    saveVersion,
    createDocument,
    getAllVersions,
    // getContributors,
} from '../controllers/doc.controller.js';

const router = express.Router();

// router.get('/:editorId/contributors', verifyToken, getContributors);
router.get('/version/:documentId', verifyToken, getVersion);
router.get('/versions/:editorId', verifyToken, getAllVersions);
router.post('/save-version', verifyToken, saveVersion);
router.post('/create', verifyToken, createDocument);
export default router;
