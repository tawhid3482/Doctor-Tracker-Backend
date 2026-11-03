import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { env } from '../config/env';

/** Creates the initial administrator once; existing accounts are never modified. */
export async function ensureInitialAdmin(): Promise<boolean> {
  const existingAdmin = await prisma.admin.findFirst({ select: { id: true } });
  if (existingAdmin) {
    console.info('Administrator account already exists; bootstrap skipped.');
    return false;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  try {
    await prisma.admin.create({
      data: {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
      },
    });
    console.info(`Initial administrator created for ${env.ADMIN_EMAIL}.`);
    return true;
  } catch (error) {
    // If two API processes start together, the unique email index makes the
    // second create fail safely. Treat it as complete when an admin now exists.
    const adminNowExists = await prisma.admin.count();
    if (adminNowExists > 0) {
      console.info('Administrator account already exists; bootstrap skipped.');
      return false;
    }
    throw error;
  }
}
