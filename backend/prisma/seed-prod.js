// Plain-JS seed runner (no ts-node required) for production containers.
// Idempotent: safe to run on every deploy.
const { PrismaClient, AdminRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  try {
    const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(seedPassword, 12);
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@oxygen.local' },
      update: {}, // do not overwrite existing password
      create: {
        email: 'admin@oxygen.local',
        passwordHash,
        fullName: 'OXYGEN Admin',
        role: AdminRole.SUPER_ADMIN,
      },
    });
    console.log(`[seed] admin OK: ${admin.email}`);
  } catch (e) {
    console.error('[seed] failed:', e.message);
    // Don't crash the deploy — backend can still serve
  } finally {
    await prisma.$disconnect();
  }
})();
