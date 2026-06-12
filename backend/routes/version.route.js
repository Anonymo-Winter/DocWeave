import express from 'express';
// import { verifyToken } from '../middlewares/verifytoken.js';
import { updateVersionDetails, deleteVersion, toggleStarVersion } from '../controllers/version.controller.js';
import { verifyToken } from '../middlewares/verifytoken.js';

const router = express.Router();

router.patch('/star', verifyToken, toggleStarVersion);
router.post('/:documentId', updateVersionDetails);
router.delete('/:documentId', verifyToken, deleteVersion);

export default router;
