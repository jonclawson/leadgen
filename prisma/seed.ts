import { auth } from "src/server/utils/auth";
import { prisma } from "../src/lib/prisma";


async function main() {
  const result = await auth.api.signUpEmail({
    body: {
      email: "admin@example.com",
      password: "admin123",
      name: "Site Admin",
    },
  });

  console.log("Admin seeded successfully:", result.user.email);

  const message = await prisma.message.create({
    data: {
      body: 'Hello, world!',
      userId: result.user.id,
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