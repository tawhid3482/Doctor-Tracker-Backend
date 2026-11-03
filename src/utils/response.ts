import { Response } from 'express';

export function sendSuccess<T>(res: Response, message: string, data: T, meta?: unknown) {
  return res.json({ success: true, message, data, ...(meta ? { meta } : {}) });
}
