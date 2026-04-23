const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ins = await prisma.inscripcion.findMany({
    include: { alumno: true, club: true }
  });
  console.log('Inscripciones totales:', ins.length);
  ins.forEach(i => {
    console.log(`${i.alumno.nombre} ${i.alumno.apellido} -> ${i.club.nombre}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
