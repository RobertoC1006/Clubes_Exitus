const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const club = await prisma.club.findUnique({
    where: { id: 1 },
  });
  console.log(JSON.stringify(club, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
