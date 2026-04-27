const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usersToDelete = await prisma.usuario.findMany({
    where: { createdAt: { gte: today } },
    select: { id: true }
  });

  const userIds = usersToDelete.map(u => u.id);
  console.log(`Usuarios a borrar (IDs): ${userIds.join(', ')}`);

  const blockingClubs = await prisma.club.findMany({
    where: { profesorId: { in: userIds } },
    select: { id: true, nombre: true, createdAt: true, profesorId: true }
  });

  console.log(`Clubes bloqueando la eliminación: ${blockingClubs.length}`);
  blockingClubs.forEach(c => {
    console.log(`- Club ID ${c.id}: "${c.nombre}" (Creado: ${c.createdAt.toISOString()}, Profesor: ${c.profesorId})`);
  });
}

main().finally(() => prisma.$disconnect());
