import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@oxygen.local' },
    update: {},
    create: {
      email: 'admin@oxygen.local',
      passwordHash,
      fullName: 'OXYGEN Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log('Seeded admin: admin@oxygen.local / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
