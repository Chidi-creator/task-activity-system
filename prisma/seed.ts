import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "test@example.com";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("[seed]: Seeded user already exists");
    return;
  }

  const password = await bcrypt.hash("password", 10);

  await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email,
      password,
    },
  });

  console.log("[seed]: Test user created — test@example.com / password");
}

main()
  .catch((e) => {
    console.error("[seed]: Failed —", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
