import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const labels = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#3b82f6" },
    { name: "Melhoria", color: "#10b981" },
    { name: "Documentação", color: "#8b5cf6" },
    { name: "Design", color: "#ec4899" },
    { name: "Urgente", color: "#f97316" },
  ];
  for (const l of labels) {
    await prisma.label.create({ data: l }).catch(() => null);
  }
  console.log("Labels seeded");
}

main().finally(() => prisma.$disconnect());
