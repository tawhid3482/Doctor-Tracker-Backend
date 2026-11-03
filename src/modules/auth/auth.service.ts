import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { HttpError } from '../../utils/http';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

function signAccessToken(adminId: string) {
  return jwt.sign({}, env.JWT_ACCESS_SECRET, {
    subject: adminId,
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  });
}

function signRefreshToken(adminId: string) {
  return jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: adminId,
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  });
}

async function issueTokenPair(adminId: string) {
  const accessToken = signAccessToken(adminId);
  const refreshToken = signRefreshToken(adminId);
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshTokenHash: hashToken(refreshToken) },
  });
  return { accessToken, refreshToken };
}

export async function signIn(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }

  const tokens = await issueTokenPair(admin.id);
  return {
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    ...tokens,
  };
}

export async function refreshSession(token: string) {
  let adminId: string;
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') throw new Error('Missing token subject');
    adminId = payload.sub;
  } catch {
    throw new HttpError(401, 'Session expired. Please sign in again');
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin?.refreshTokenHash || admin.refreshTokenHash !== hashToken(token)) {
    throw new HttpError(401, 'Session expired. Please sign in again');
  }

  return issueTokenPair(admin.id);
}

export async function revokeRefreshSession(token?: string) {
  if (!token) return;
  let adminId: string;
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') return;
    adminId = payload.sub;
  } catch {
    // An expired/invalid refresh token is already unusable; the controller still clears cookies.
    return;
  }
  await prisma.admin.updateMany({
    where: { id: adminId, refreshTokenHash: hashToken(token) },
    data: { refreshTokenHash: null },
  });
}

export async function getCurrentAdmin(adminId?: string) {
  if (!adminId) throw new HttpError(401, 'Please sign in to continue');
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!admin) throw new HttpError(401, 'Account not found');
  return admin;
}
