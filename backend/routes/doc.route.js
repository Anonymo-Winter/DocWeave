import express from 'express';
import { verifyToken } from '../middlewares/verifytoken.js';
import multer from 'multer';
import fs from 'node:fs';
import cloudinary from '../util/cloudinary.js';
import {
    getVersion,
    saveVersion,
    createDocument,
    getAllVersions,
    addPeople,
    getDocument,
    uploadImageInEditor,
    generatePDF,
    updateDocument,
    changeDocName,
    getUserDocuments,
    toggleStarDocument,
    // getContributors,
} from '../controllers/doc.controller.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();
const upload = multer({ dest: 'uploads' });

router.post('/create', verifyToken, createDocument);

router.get('/document/:editorId', verifyToken, authorize('READ'), getDocument);
router.get('/version/:documentId', verifyToken, authorize('READ'), getVersion);
router.get('/versions/:editorId', verifyToken, authorize('READ'), getAllVersions);

router.post('/save-version', verifyToken, authorize('SAVE_VERSION'), saveVersion);
router.post('/doc-rename', verifyToken, authorize('RENAME_DOC'), changeDocName);
router.post('/document/:editorId', verifyToken, authorize('UPDATE_VISIBILITY'), updateDocument);

router.post('/add-people', verifyToken, authorize('ADD_COLLABORATOR'), addPeople);

router.post(
    '/:documentId/upload',
    verifyToken,
    authorize('UPLOAD_IMAGE'),
    upload.single('file'),
    verifyToken,
    uploadImageInEditor,
);
router.post('/generate-pdf', verifyToken, authorize('EXPORT_PDF'), generatePDF);

router.get('/user-documents/:userId', verifyToken, getUserDocuments);

router.post('/:documentId/star', verifyToken, toggleStarDocument);

export default router;
