import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/http';

const methodsWithSideEffects = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const allowedOrigin = new URL(env.CLIENT_ORIGIN).origin;

export function requireAllowedOrigin(req: Request, _res: Response, next: NextFunction) {
  const origin = req.get('origin');
  if (methodsWithSideEffects.has(req.method) && origin && origin !== allowedOrigin) {
    return next(new HttpError(403, 'Request origin is not allowed'));
  }
  next();
}
