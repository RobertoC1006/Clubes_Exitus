const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`🧹 Limpieza quirúrgica desde: ${today.toISOString()}`);

  // 1. Identificar Usuarios de hoy
  const usersToday = await prisma.usuario.findMany({
    where: { createdAt: { gte: today } },
    select: { id: true }
  });
  const userIds = usersToday.map(u => u.id);

  // 2. Identificar Clubes de hoy o que dependen de usuarios de hoy
  const clubsToDelete = await prisma.club.findMany({
    where: {
      OR: [
        { createdAt: { gte: today } },
        { profesorId: { in: userIds } }
      ]
    },
    select: { id: true }
  });
  const clubIds = clubsToDelete.map(c => c.id);

  // 3. Identificar Alumnos de hoy o que dependen de usuarios de hoy (padres)
  const alumnosToDelete = await prisma.alumno.findMany({
    where: {
      OR: [
        { createdAt: { gte: today } },
        { padreId: { in: userIds } }
      ]
    },
    select: { id: true }
  });
  const alumnoIds = alumnosToDelete.map(a => a.id);

  console.log(`Borrando: ${userIds.length} usuarios, ${clubIds.length} clubes, ${alumnoIds.length} alumnos.`);

  // 4. Borrar en orden de dependencia
  
  // Nivel 3: Transacciones (referencian Club y Alumno y Usuario)
  await prisma.asistencia.deleteMany({ where: { OR: [{ alumnoId: { in: alumnoIds } }, { sesion: { clubId: { in: clubIds } } }] } });
  await prisma.sesion.deleteMany({ where: { clubId: { in: clubIds } } });
  await prisma.inscripcion.deleteMany({ where: { OR: [{ alumnoId: { in: alumnoIds } }, { clubId: { in: clubIds } }] } });
  await prisma.pago.deleteMany({ where: { OR: [{ alumnoId: { in: alumnoIds } }, { clubId: { in: clubIds } }] } });
  await prisma.notificacion.deleteMany({ where: { usuarioId: { in: userIds } } });

  // Nivel 2: Entidades secundarias
  await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
  await prisma.alumno.deleteMany({ where: { id: { in: alumnoIds } } });

  // Nivel 1: Usuarios
  await prisma.usuario.deleteMany({ where: { id: { in: userIds } } });

  console.log('✨ Limpieza quirúrgica completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
