// Usage: npm run create-admin -- "Name" "email@example.com" "Password123!" [ADMIN|SUPER_ADMIN|STAFF]
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [name, email, password, role] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "Name" "email@example.com" "Password123!" [ADMIN|SUPER_ADMIN|STAFF]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, role: (role as never) || "ADMIN" },
    create: { name, email, passwordHash, role: (role as never) || "ADMIN" },
  });

  console.log(`Admin ready: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
