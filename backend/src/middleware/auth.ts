import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(new AppError('Authentication token required', 401));
  }

  try {
    const user = verifyToken(token);
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};
