import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { ensureInitialAdmin } from './services/admin-bootstrap';

async function start() {
  await prisma.$connect();
  await ensureInitialAdmin();
  app.listen(env.PORT, () => console.info(`Doctor Tracker API listening on port ${env.PORT}`));
}

void start().catch(error => { console.error('Failed to start API', error); process.exit(1); });
