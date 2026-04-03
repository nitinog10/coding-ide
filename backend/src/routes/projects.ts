import { Router, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { 
  createProject, 
  getUserProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../services/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Get all user projects
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const projects = await getUserProjects(userId);

      res.json({ projects });
    } catch (error) {
      next(error);
    }
  }
);

// Create new project
router.post(
  '/',
  authenticateToken,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('code').isString().withMessage('Code must be a string'),
    body('language').isIn(['cpp', 'python', 'java', 'javascript']).withMessage('Invalid language')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { name, code, language } = req.body;
      const userId = req.user!.id;

      const project = await createProject(userId, name, code, language);

      logger.info('Project created', { userId, projectId: project.id });

      res.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  }
);

// Update project
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    body('name').optional().trim().notEmpty(),
    body('code').optional().isString(),
    body('language').optional().isIn(['cpp', 'python', 'java', 'javascript'])
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { id } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      // Verify project ownership
      const project = await getProjectById(id);
      if (!project) {
        return next(new AppError('Project not found', 404));
      }

      if (project.userId !== userId) {
        return next(new AppError('Unauthorized', 403));
      }

      await updateProject(id, userId, updates);

      logger.info('Project updated', { userId, projectId: id });

      res.json({ message: 'Project updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete project
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Invalid project ID')],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { id } = req.params;
      const userId = req.user!.id;

      // Verify project ownership
      const project = await getProjectById(id);
      if (!project) {
        return next(new AppError('Project not found', 404));
      }

      if (project.userId !== userId) {
        return next(new AppError('Unauthorized', 403));
      }

      await deleteProject(id, userId);

      logger.info('Project deleted', { userId, projectId: id });

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
