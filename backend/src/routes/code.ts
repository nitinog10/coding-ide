import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { executionService } from '../services/executionService';
import { AppError } from '../middleware/errorHandler';
import rateLimit from 'express-rate-limit';

type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

const router = Router();

// Rate limiter for code execution
const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.CODE_EXEC_RATE_LIMIT_MAX_REQUESTS || '20'),
  message: 'Too many execution requests, please try again later'
});

// Execute code endpoint (no auth required for demo)
router.post(
  '/execute',
  executionLimiter,
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').isIn(['cpp', 'python', 'java', 'javascript']).withMessage('Invalid language'),
    body('stdin').optional().isString()
  ],
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { code, language, stdin = '' } = req.body;

      // Validate code size
      const maxSize = parseInt(process.env.CODE_MAX_SIZE_BYTES || '102400');
      if (Buffer.byteLength(code, 'utf8') > maxSize) {
        return next(new AppError(`Code exceeds maximum size of ${maxSize} bytes`, 400));
      }

      logger.info('Executing code', { language, codeLength: code.length });

      // Execute code
      const output = await executionService.executeCode(
        code,
        language as SupportedLanguage,
        stdin
      );

      res.json({
        success: output.exitCode === 0,
        output
      });

    } catch (error) {
      next(error);
    }
  }
);

export default router;
