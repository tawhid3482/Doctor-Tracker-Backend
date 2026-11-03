import { prisma } from './config/db';
import { ensureInitialAdmin } from './services/admin-bootstrap';

void ensureInitialAdmin()
  .catch(error => {
    console.error('Failed to bootstrap administrator', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
