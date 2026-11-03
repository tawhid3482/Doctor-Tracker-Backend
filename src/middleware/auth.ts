import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../utils/http';

declare global { namespace Express { interface Request { adminId?: string } } }

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return next(new HttpError(401, 'Please sign in to continue'));
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') throw new Error('Invalid token');
    req.adminId = payload.sub;
    next();
  } catch { next(new HttpError(401, 'Session expired. Please sign in again')); }
}
