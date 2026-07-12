import { getAuth } from "src/server/utils/auth";
import { getPrisma } from "../src/lib/prisma";


async function main() {
  const auth = await getAuth();
  const result = await auth.api.signUpEmail({
    body: {
      email: "admin@example.com",
      password: "admin123",
      name: "Site Admin",
    },
  });

  console.log("Admin seeded successfully:", result.user.email);
  const prisma = await getPrisma();
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
    await getPrisma().then(prisma => prisma.$disconnect());
  })
  .catch(async (e) => {
    console.error(e);
    await getPrisma().then(prisma => prisma.$disconnect());
    process.exit(1);
  });