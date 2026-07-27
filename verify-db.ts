import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "./lib/password";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { username: "coordenador" } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  console.log("User found:", user.username);
  const isValid = await verifyPassword("coord12345", user.passwordHash);
  console.log("Is coord12345 valid?", isValid);
  
  // also check login attempts
  const attempts = await prisma.loginAttempt.count({
    where: { ip: "unknown", success: false }
  });
  console.log("Failed attempts for 'unknown' IP:", attempts);
  
  if (attempts >= 5) {
    console.log("Clearing attempts...");
    await prisma.loginAttempt.deleteMany();
    console.log("Attempts cleared.");
  }
}

main().finally(() => prisma.$disconnect());
