import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth';
import { login, logout, me, refresh } from './auth.controller';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again later.' },
});

authRouter.post('/login', loginLimiter, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
