import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';


export const tableMap: Record<string, string> = {
  'rooms': 'room',
  'room_sectors': 'room_sector',
  'cabinets': 'cabinet',
  'categories': 'category',
  'items': 'item',
  'inventories': 'inventory'
};

export const serverError = (res: Response, error: any): void => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    message: 'Server Error', 
    error: error 
  });
};

export interface AuthRequest extends Request {
  user?: { username: string; role: string };
}

export const authCheck = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied: No token found' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Access denied: Invalid or expired token' });
      return;
    }

    req.user = decoded as { username: string; role: string };
    
    next();
  });
};

export const roleCheck = (requiredRoles: string[]): RequestHandler => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      return;
    }
    
    next();
  };
};