const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.sesion.deleteMany({
    where: {
      asistencias: {
        none: {}
      }
    }
  });
  console.log('Deleted empty sessions:', deleted.count);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
