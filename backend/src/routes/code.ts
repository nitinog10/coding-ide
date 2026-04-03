import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { executionService } from '../services/executionService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, SupportedLanguage } from '../types';
import { logger } from '../utils/logger';
import { logExecution, getUserStats, updateUserStats } from '../services/database';
import { calculateXP, calculateLevel } from '../utils/gamification';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for code execution
const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.CODE_EXEC_RATE_LIMIT_MAX_REQUESTS || '20'),
  message: 'Too many execution requests, please try again later'
});

// Execute code endpoint
router.post(
  '/execute',
  authenticateToken,
  executionLimiter,
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').isIn(['cpp', 'python', 'java', 'javascript']).withMessage('Invalid language'),
    body('stdin').optional().isString()
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { code, language, stdin = '' } = req.body;
      const userId = req.user!.id;

      // Validate code size
      const maxSize = parseInt(process.env.CODE_MAX_SIZE_BYTES || '102400');
      if (Buffer.byteLength(code, 'utf8') > maxSize) {
        return next(new AppError(`Code exceeds maximum size of ${maxSize} bytes`, 400));
      }

      logger.info('Executing code', { userId, language, codeLength: code.length });

      // Execute code
      const output = await executionService.executeCode(
        code,
        language as SupportedLanguage,
        stdin
      );

      // Log execution asynchronously
      logExecution(userId, code, language, output).catch(error => {
        logger.error('Failed to log execution', { error, userId });
      });

      // Update user stats and award XP asynchronously
      updateUserStatsAndXP(userId, language as SupportedLanguage, output.exitCode === 0, code.length)
        .catch(error => {
          logger.error('Failed to update user stats', { error, userId });
        });

      res.json({
        success: output.exitCode === 0,
        output
      });

    } catch (error) {
      next(error);
    }
  }
);

async function updateUserStatsAndXP(
  userId: string,
  language: SupportedLanguage,
  success: boolean,
  codeLength: number
) {
  const stats = await getUserStats(userId);
  if (!stats) {
    logger.warn('User stats not found', { userId });
    return;
  }

  // Calculate XP
  const xpGained = calculateXP(codeLength, success);
  const newXP = stats.xp + xpGained;
  const newLevel = calculateLevel(newXP);

  // Update stats
  const executionsByLanguage = { ...stats.executionsByLanguage };
  executionsByLanguage[language] = (executionsByLanguage[language] || 0) + 1;

  await updateUserStats(userId, {
    xp: newXP,
    level: newLevel,
    totalExecutions: stats.totalExecutions + 1,
    successfulExecutions: success ? stats.successfulExecutions + 1 : stats.successfulExecutions,
    executionsByLanguage
  });

  logger.info('User stats updated', { userId, xpGained, newXP, newLevel });
}

export default router;
