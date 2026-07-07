import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const coordinator = await prisma.user.create({
      data: {
        name: "Coordenador",
        username: "coordenador",
        passwordHash: await hashPassword("coord12345"),
        role: "coordinator",
      },
    });
    const member = await prisma.user.create({
      data: {
        name: "Responsável Demo",
        username: "membro",
        passwordHash: await hashPassword("membro12345"),
        role: "member",
      },
    });
    console.log("Usuários de teste criados: coordenador/coord12345, membro/membro12345");

    const existingColumns = await prisma.column.count();
    if (existingColumns === 0) {
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
            assigneeId: coordinator.id,
            dueDate: inThreeDays,
            columnId: todo.id,
            order: 0,
          },
          {
            title: "Revisar layout do dashboard",
            description: "Ajustar espaçamentos e cores conforme o design.",
            assigneeId: member.id,
            columnId: todo.id,
            order: 1,
          },
          {
            title: "Implementar autenticação",
            description: "Login com usuário e senha próprios.",
            assigneeId: coordinator.id,
            dueDate: yesterday,
            columnId: doing.id,
            order: 0,
          },
          {
            title: "Configurar CI/CD",
            description: "Pipeline de build e deploy automático.",
            assigneeId: member.id,
            columnId: done.id,
            order: 0,
          },
        ],
      });
      console.log("Colunas e tarefas de exemplo criadas.");
    }
  } else {
    console.log("Usuários já existem, pulando seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
