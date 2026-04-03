import { Router, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserStats } from '../services/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = Router();

// Get user stats
router.get(
  '/stats',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const stats = await getUserStats(userId);

      if (!stats) {
        return next(new AppError('User stats not found', 404));
      }

      res.json({ stats });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
