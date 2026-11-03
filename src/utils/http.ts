import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { void fn(req, res, next).catch(next); };

export function pagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
