import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.column.count();
  if (existing > 0) {
    console.log("Banco já populado, pulando seed.");
    return;
  }

  const todo = await prisma.column.create({
    data: { title: "A Fazer", color: "#71717a", order: 0 },
  });
  const doing = await prisma.column.create({
    data: { title: "Fazendo", color: "#f59e0b", order: 1 },
  });
  const done = await prisma.column.create({
    data: { title: "Concluído", color: "#10b981", order: 2, isDone: true },
  });

  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Planejar sprint",
        description: "Definir escopo e prioridades da próxima sprint.",
        assignee: "Daniel",
        dueDate: inThreeDays,
        columnId: todo.id,
        order: 0,
      },
      {
        title: "Revisar layout do dashboard",
        description: "Ajustar espaçamentos e cores conforme o design.",
        assignee: "Ana",
        columnId: todo.id,
        order: 1,
      },
      {
        title: "Implementar autenticação",
        description: "Login com e-mail e senha usando NextAuth.",
        assignee: "Daniel",
        dueDate: yesterday,
        columnId: doing.id,
        order: 0,
      },
      {
        title: "Configurar CI/CD",
        description: "Pipeline de build e deploy automático.",
        assignee: "Carlos",
        columnId: done.id,
        order: 0,
      },
    ],
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
