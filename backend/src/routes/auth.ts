import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, getUserByUsername, initializeUserStats } from '../services/database';
import { hashPassword, comparePassword, generateToken, validatePassword, validateEmail } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Register endpoint
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { username, email, password } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        return next(new AppError('Invalid email format', 400));
      }

      // Validate password complexity
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return next(new AppError(passwordValidation.errors[0], 400));
      }

      // Check if user already exists
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        return next(new AppError('Username already exists', 409));
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await createUser(username, email, passwordHash);

      // Initialize user stats
      await initializeUserStats(user.id);

      logger.info('User registered successfully', { userId: user.id, username });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { username, password } = req.body;

      // Get user from database
      const user = await getUserByUsername(username);
      if (!user) {
        logger.warn('Login attempt with non-existent username', { username });
        return next(new AppError('Invalid username or password', 401));
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn('Login attempt with incorrect password', { userId: user.id, username });
        return next(new AppError('Invalid username or password', 401));
      }

      // Generate token
      const token = generateToken(user.id, user.username);

      logger.info('User logged in successfully', { userId: user.id, username });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Logout endpoint (client-side token removal, but we log it)
router.post('/logout', (req: Request, res: Response) => {
  logger.info('User logged out', { userId: (req as any).user?.id });
  res.json({ message: 'Logged out successfully' });
});

export default router;
