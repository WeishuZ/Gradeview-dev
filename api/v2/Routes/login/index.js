import { Router } from 'express';
import { validateAdminOrStudentMiddleware } from '../../../lib/authlib.mjs';
import RateLimit from 'express-rate-limit';

const router = Router({ mergeParams: true });

router.use(RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10000, // 100 requests
}));

// Main login endpoint - validates token and returns status
router.get('/', validateAdminOrStudentMiddleware, (_, res) => {
    res.json({ status: true });
});

// Error handler for this router
router.use((error, req, res, next) => {
    console.error('Login error:', error);
    res.status(401).json({ status: false, error: 'Unauthorized' });
});

export default router;
