const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const padre = await prisma.usuario.findUnique({
    where: { dni: '71105970' },
    include: { hijos: true }
  });

  if (!padre) {
    console.log('Padre no encontrado');
    return;
  }

  console.log('Padre:', padre.nombre, padre.apellido);
  for (const hijo of padre.hijos) {
    console.log('\nHijo:', hijo.nombre, hijo.apellido, '(ID:', hijo.id, ')');
    const asistencias = await prisma.asistencia.findMany({
      where: { alumnoId: hijo.id },
      include: { sesion: true },
      orderBy: { sesion: { fecha: 'desc' } }
    });
    console.log('Asistencias:', asistencias.map(a => ({ fecha: a.sesion.fecha, estado: a.estado })));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
