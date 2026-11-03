import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('../src/config/db', () => ({
  prisma: {
    admin: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from '../src/config/db';
import { ensureInitialAdmin } from '../src/services/admin-bootstrap';

describe('initial administrator bootstrap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('leaves the database unchanged when an admin already exists', async () => {
    vi.mocked(prisma.admin.findFirst).mockResolvedValue({ id: 'existing-admin' } as never);

    await expect(ensureInitialAdmin()).resolves.toBe(false);
    expect(prisma.admin.create).not.toHaveBeenCalled();
  });

  it('creates an admin with a hashed password when none exists', async () => {
    vi.mocked(prisma.admin.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.admin.create).mockResolvedValue({ id: 'new-admin' } as never);

    await expect(ensureInitialAdmin()).resolves.toBe(true);

    const createArgs = vi.mocked(prisma.admin.create).mock.calls[0][0];
    expect(createArgs.data.email).toBe(process.env.ADMIN_EMAIL?.toLowerCase());
    expect(createArgs.data.passwordHash).not.toBe(process.env.ADMIN_PASSWORD);
    await expect(bcrypt.compare(process.env.ADMIN_PASSWORD!, createArgs.data.passwordHash!)).resolves.toBe(true);
  });
});
