import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.user.deleteMany();

  const coordHash = await hashPassword("coord12345");
  const coordinator = await prisma.user.create({
    data: {
      name: "Coordenador",
      username: "coordenador",
      passwordHash: coordHash,
      role: "coordinator",
    },
  });

  const memberHash = await hashPassword("membro12345");
  const member = await prisma.user.create({
    data: {
      name: "Responsável Demo",
      username: "membro",
      passwordHash: memberHash,
      role: "member",
    },
  });

  const extraUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Membro Equipe ${i}`,
        username: `membro${i}`,
        passwordHash: memberHash,
        role: "member",
      },
    });
    extraUsers.push(user);
  }

  const users = [coordinator, member, ...extraUsers];

  console.log("Usuários criados com sucesso.");

  const todo = await prisma.column.create({
    data: { title: "A Fazer", color: "#71717a", order: 0 },
  });
  const doing = await prisma.column.create({
    data: { title: "Fazendo", color: "#f59e0b", order: 1 },
  });
  const done = await prisma.column.create({
    data: { title: "Concluído", color: "#10b981", order: 2, isDone: true },
  });

  const columns = [todo, doing, done];
  const now = new Date();
  
  const tasks = [];
  for (let i = 1; i <= 30; i++) {
    // Espalhar vencimentos pelo mês (de -5 dias até +25 dias a partir de hoje)
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + (i - 5));
    
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomColumn = columns[Math.floor(Math.random() * columns.length)];
    
    // Adicionar um pouco de markdown para testar
    const description = `Descrição detalhada da tarefa ${i}.\n\n- Ponto 1\n- Ponto 2\n\n**Importante:** Revisar antes de concluir.`;
    
    tasks.push({
      title: `Tarefa ${i} do Mês`,
      description,
      assigneeId: randomUser.id,
      dueDate,
      columnId: randomColumn.id,
      order: i,
    });
  }

  await prisma.task.createMany({ data: tasks });
  console.log("Colunas e 30 tarefas do mês criadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
