import { Router } from 'express';
import { createContactMessage } from '../controllers/contactController.js';

const router = Router();

// Keep contact routes in their own file so more API endpoints can be added cleanly.
router.post('/', createContactMessage);

export default router;
