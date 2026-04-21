const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const club = await prisma.club.findFirst({
    where: { nombre: 'Fútbol' },
    include: { _count: { select: { inscripciones: true } } }
  });
  console.log(`Club: ${club.nombre}, Inscritos: ${club._count.inscripciones}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
