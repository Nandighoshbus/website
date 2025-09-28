import { Router } from 'express';
import { submitContactForm, getContactInfo } from '../controllers/contactController';

const router = Router();

// POST /api/v1/contact/submit - Submit contact form
router.post('/submit', submitContactForm);

// GET /api/v1/contact/info - Get contact information
router.get('/info', getContactInfo);

export default router;
