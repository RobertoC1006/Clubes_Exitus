/**
 * Script de recuperación de contraseña del ADMINISTRADOR
 * 
 * Úsalo si el administrador olvida su contraseña:
 *   node prisma/reset-admin.js
 * 
 * Esto reseteará la contraseña a "123456" y forzará el cambio
 * en el próximo login.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.findFirst({
    where: { rol: 'ADMINISTRADOR' },
  });

  if (!admin) {
    console.error('❌ No se encontró ningún usuario ADMINISTRADOR en la base de datos.');
    process.exit(1);
  }

  await prisma.usuario.update({
    where: { id: admin.id },
    data: { password: '123456', mustChangePassword: true },
  });

  console.log(`✅ Contraseña reseteada para: ${admin.nombre} ${admin.apellido} (DNI: ${admin.dni})`);
  console.log('   Ingresa con tu DNI y la contraseña temporal: 123456');
  console.log('   Se te pedirá crear una nueva contraseña al iniciar sesión.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
