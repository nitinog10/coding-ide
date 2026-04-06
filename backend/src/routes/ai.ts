import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { aiService } from '../services/aiService';
import { AppError } from '../middleware/errorHandler';
import rateLimit from 'express-rate-limit';

type AIAction = 'explain' | 'debug' | 'optimize' | 'convert' | 'chat';
type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

interface CodeContext {
  language: SupportedLanguage;
  code: string;
  error?: string;
}

const router = Router();

// Rate limiter for AI requests
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '10'),
  message: 'Too many AI requests, please try again later'
});

// AI assistance endpoint (no auth required for demo)
router.post(
  '/assist',
  aiLimiter,
  [
    body('query').trim().notEmpty().withMessage('Query is required'),
    body('codeContext').isObject().withMessage('Code context is required'),
    body('codeContext.language').isIn(['cpp', 'python', 'java', 'javascript']).withMessage('Invalid language'),
    body('codeContext.code').optional().isString(),
    body('action').isIn(['explain', 'debug', 'optimize', 'convert', 'chat']).withMessage('Invalid action')
  ],
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { query, codeContext, action } = req.body;

      logger.info('AI assistance requested', { action, language: codeContext.language });

      // Call AI service
      const result = await aiService.assistWithCode(
        query,
        codeContext as CodeContext,
        action as AIAction
      );

      res.json({
        success: true,
        response: result.response,
        suggestions: result.suggestions
      });

    } catch (error: any) {
      logger.error('AI assistance error', { error: error.message });
      next(new AppError(error.message || 'AI service unavailable', 500));
    }
  }
);

export default router;
