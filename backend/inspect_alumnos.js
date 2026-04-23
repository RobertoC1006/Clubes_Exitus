const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alumnos = await prisma.alumno.findMany();
  console.log('--- ALUMNOS ---');
  alumnos.forEach(a => {
    console.log(`ID: ${a.id}, Nombre: ${a.nombre} ${a.apellido}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
