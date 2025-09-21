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
    fetchDocShareableData,
    uploadImageInEditor,
    generatePDF,
    // getContributors,
} from '../controllers/doc.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads' });

// router.get('/:editorId/contributors', verifyToken, getContributors);
router.get('/version/:documentId', verifyToken, getVersion);
router.get('/versions/:editorId', verifyToken, getAllVersions);
router.post('/save-version', verifyToken, saveVersion);
router.post('/create', verifyToken, createDocument);
// router.post('/add-people', verifyToken, addPeople);
// router.get('/fetch-doc-sharable-access/:editorId', verifyToken, fetchDocShareableData);
// can be removed
router.post('/add-people', addPeople);
router.get('/fetch-doc-sharable-access/:editorId', fetchDocShareableData);
router.post('/:documentId/upload', upload.single('file'), verifyToken, uploadImageInEditor);
router.post('/generate-pdf', generatePDF);
export default router;
