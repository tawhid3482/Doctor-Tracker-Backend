import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http';

export const notFound: RequestHandler = (_req, res) => { res.status(404).json({ success: false, message: 'Route not found' }); };

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    return res.status(400).json({ success: false, message: 'Malformed JSON request body' });
  }
  if (error instanceof ZodError) return res.status(400).json({ success: false, message: 'Request validation failed', errors: error.flatten().fieldErrors });
  if (error instanceof HttpError) return res.status(error.status).json({ success: false, message: error.message });
  if (error?.code === 'P2002') return res.status(409).json({ success: false, message: 'A record with this value already exists' });
  if (error?.code === 'P2025') return res.status(404).json({ success: false, message: 'Record not found' });
  if (error?.code === 'P2003') return res.status(409).json({ success: false, message: 'This record is still linked to other records' });
  if (error?.code === 'P2023') return res.status(400).json({ success: false, message: 'The record identifier is invalid' });
  console.error(error);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred' });
};
