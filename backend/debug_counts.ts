import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const clubes = await prisma.club.findMany({
    include: {
      _count: { select: { inscripciones: true } },
      inscripciones: { include: { alumno: true } }
    }
  });

  console.log('--- CLUBES EN DB ---');
  clubes.forEach(c => {
    console.log(`ID: ${c.id}, Nombre: ${c.nombre}, Inscritos: ${c._count.inscripciones}`);
    c.inscripciones.forEach(ins => {
      console.log(`  - Alumno: ${ins.alumno.nombre} ${ins.alumno.apellido}`);
    });
  });

  const totalAlumnos = await prisma.alumno.count();
  console.log(`\nTotal Alumnos en Sistema: ${totalAlumnos}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
