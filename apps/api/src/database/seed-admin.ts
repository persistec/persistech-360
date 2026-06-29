import { PrismaClient, AppRole } from '@prisma/client';

export async function bootstrapAdmin(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv = process.env,
) {
  const rawEmail = env.INITIAL_ADMIN_EMAIL;
  const rawName = env.INITIAL_ADMIN_NAME;

  if (!rawEmail || !rawName) return;

  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim();

  if (!email || !name) return;

  console.log('Bootstrapping initial admin from environment variables.');
  await prisma.user.upsert({
    where: { workspaceEmail: email },
    update: {
      appRole: AppRole.ADMIN,
      name: name,
    },
    create: {
      workspaceEmail: email,
      name: name,
      appRole: AppRole.ADMIN,
    },
  });
  console.log('Initial admin bootstrapped successfully.');
}
