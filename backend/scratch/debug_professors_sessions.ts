import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    where: { rol: 'PROFESOR' },
    include: {
      clubes: {
        include: {
          sesiones: true
        }
      }
    }
  });

  console.log(`Found ${users.length} professors.`);

  users.forEach(u => {
    console.log(`Profesor: ${u.nombre} ${u.apellido} (ID: ${u.id})`);
    u.clubes.forEach(c => {
      console.log(`  Club: ${c.nombre} (ID: ${c.id})`);
      console.log(`    Sessions: ${c.sesiones.length}`);
      c.sesiones.forEach(s => {
        console.log(`      Session ID: ${s.id}, Date: ${s.fecha.toISOString()}`);
      });
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
