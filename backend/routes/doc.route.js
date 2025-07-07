import express from 'express';
import { verifyToken } from '../middlewares/verifytoken.js';
import { getVersion, saveVersion, createDocument } from '../controllers/doc.controller.js';
const router = express.Router();

router.get('/version/:documentId', verifyToken, getVersion);
router.post('/save-version', verifyToken, saveVersion);
router.post('/create', verifyToken, createDocument);
export default router;
