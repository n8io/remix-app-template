import { PrismaClient, Role } from "@prisma/client";

const db = new PrismaClient();

const main = async () => {
  const adminUser = {
    email: "admin@example.com",
    role: Role.ADMIN,
    passwordHash: "admin",
    username: "admin",
  };

  const user = await db.user.upsert({
    create: adminUser,
    where: { username: adminUser.username },
    update: {},
  });

  console.info(`🌱 Admin user seeded`, JSON.stringify(user));

  const profile = await db.profile.upsert({
    create: {
      name: "Admin",
      userId: user.id,
    },
    where: { userId: user.id },
    update: {},
  });

  console.info(`🌱 Admin profile seeded`, JSON.stringify(profile));
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
