const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clubes = await prisma.club.findMany({
    include: { _count: { select: { inscripciones: true } } }
  });
  console.log('--- CLUBES ---');
  clubes.forEach(c => {
    console.log(`ID: ${c.id}, Nombre: ${c.nombre}, Inscritos: ${c._count.inscripciones}`);
  });

  const alumnos = await prisma.alumno.count();
  console.log('\nTotal Alumnos:', alumnos);

  const inscripciones = await prisma.inscripcion.count();
  console.log('Total Inscripciones:', inscripciones);
}

main().catch(console.error).finally(() => prisma.$disconnect());
