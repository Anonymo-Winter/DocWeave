import express from 'express';
// import { verifyToken } from '../middlewares/verifytoken.js';
import { updateVersionDetails } from '../controllers/version.controller.js';

const router = express.Router();

router.put('/:id', updateVersionDetails);

export default router;
