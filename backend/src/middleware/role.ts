import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
