const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando sesiones duplicadas...');
  
  // Obtenemos todas las sesiones
  const sesiones = await prisma.sesion.findMany({
    orderBy: { fecha: 'asc' }
  });

  console.log(`📊 Total de sesiones encontradas: ${sesiones.length}`);

  const seen = new Set();
  const toDelete = [];

  for (const s of sesiones) {
    // Normalizar la fecha a solo día (YYYY-MM-DD)
    const day = s.fecha.toISOString().split('T')[0];
    const key = `${s.clubId}-${day}`;

    if (seen.has(key)) {
      toDelete.push(s.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`🗑️ Borrando ${toDelete.length} sesiones duplicadas...`);
    
    // Primero borramos las asistencias vinculadas a estas sesiones
    await prisma.asistencia.deleteMany({
      where: { sesionId: { in: toDelete } }
    });

    // Luego borramos las sesiones
    const result = await prisma.sesion.deleteMany({
      where: { id: { in: toDelete } }
    });
    
    console.log(`✅ ${result.count} sesiones borradas exitosamente.`);
  } else {
    console.log('✅ No se encontraron sesiones duplicadas.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
