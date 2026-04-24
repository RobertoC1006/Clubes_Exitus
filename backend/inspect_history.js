const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ses = await prisma.sesion.count();
  const asi = await prisma.asistencia.count();
  console.log('Sesiones:', ses);
  console.log('Asistencias:', asi);
}

main().catch(console.error).finally(() => prisma.$disconnect());
