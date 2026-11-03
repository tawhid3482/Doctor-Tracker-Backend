import { CookieOptions, RequestHandler } from 'express';
import { env } from '../../config/env';
import { asyncHandler, HttpError } from '../../utils/http';
import { sendSuccess } from '../../utils/response';
import { getCurrentAdmin, refreshSession, revokeRefreshSession, signIn } from './auth.service';
import { loginSchema } from './auth.validation';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1',
};
const accessCookieOptions: CookieOptions = { ...baseCookieOptions, maxAge: 15 * 60 * 1000 };
const refreshCookieOptions = {
  ...accessCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function attachCookies(res: Parameters<RequestHandler>[1], tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('accessToken', tokens.accessToken, accessCookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
}

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await signIn(input.email, input.password);
  attachCookies(res, result);
  return sendSuccess(res, 'Signed in', result.admin);
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw new HttpError(401, 'Refresh session is missing');
  const tokens = await refreshSession(token);
  attachCookies(res, tokens);
  return sendSuccess(res, 'Session refreshed', { authenticated: true });
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  await revokeRefreshSession(req.cookies?.refreshToken);
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
  return sendSuccess(res, 'Signed out', null);
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  const admin = await getCurrentAdmin(req.adminId);
  return sendSuccess(res, 'Current administrator', admin);
});
