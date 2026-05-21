import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const users = ["nova", "orion", "vega", "luna"];

  for (const username of users) {
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@galaxy-pong.local`,
        displayName: username,
        passwordHash,
        statusMessage: "Ready for the next match"
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
