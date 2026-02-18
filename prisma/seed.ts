import { prisma } from "../src/lib/prisma";
import bcrypt from 'bcryptjs'


async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  });

  console.log({ user });

  const message = await prisma.message.create({
    data: {
      body: 'Hello, world!',
      userId: user.id,
    },
  });

  console.log({ message });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });