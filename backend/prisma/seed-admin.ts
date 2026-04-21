import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dni = '71105971';
  const password = '12345678';
  
  const admin = await prisma.usuario.findUnique({
    where: { dni },
  });

  if (!admin) {
    await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        apellido: 'Clubes',
        dni,
        password,
        rol: 'ADMINISTRADOR',
      },
    });
    console.log(`Admin user created with DNI: ${dni}`);
  } else {
    // Si ya existe, nos aseguramos que sea administrador y tenga la contraseña solicitada
    await prisma.usuario.update({
      where: { dni },
      data: {
        rol: 'ADMINISTRADOR',
        password,
      },
    });
    console.log(`Admin user already exists. Credentials and role updated.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
