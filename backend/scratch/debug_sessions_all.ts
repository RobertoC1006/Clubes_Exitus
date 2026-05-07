import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sesion.findMany({
    include: {
      club: {
        include: {
          profesor: true
        }
      }
    }
  });

  console.log('Total sessions:', sessions.length);
  sessions.forEach(s => {
    console.log(`ID: ${s.id}, Date: ${s.fecha.toISOString()}, Club: ${s.club.nombre}, Profesor: ${s.club.profesor.nombre} ${s.club.profesor.apellido} (ID: ${s.club.profesorId})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
