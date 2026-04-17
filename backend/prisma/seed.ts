import { PrismaClient, EstadoAsistencia } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');
  await prisma.asistencia.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.club.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🌱 Sembrando datos falsos (Mock Data)...');

  // 1. Crear Profesor
  const profePerez = await prisma.usuario.create({
    data: {
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan.perez@colegio.edu',
      rol: 'PROFESOR',
      password: '123'
    }
  });

  // 2. Crear Clubes anexados al profesor
  const clubFutbol = await prisma.club.create({
    data: {
      nombre: 'Fútbol Selección',
      descripcion: 'Entrenamiento y competencias',
      profesorId: profePerez.id
    }
  });

  const clubAjedrez = await prisma.club.create({
    data: {
      nombre: 'Taller de Ajedrez',
      descripcion: 'Estrategia y desarrollo lógico',
      profesorId: profePerez.id
    }
  });

  // 3. Crear Alumnos
  const nombres = ['Mateo', 'Valentina', 'Santiago', 'Camila', 'Luciana', 'Diego', 'Matías', 'Sofía', 'Joaquín', 'Emma'];
  const grados = ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec'];

  const alumnos: any[] = [];
  for (let i = 0; i < nombres.length; i++) {
    const alumno = await prisma.alumno.create({
      data: {
        nombre: nombres[i],
        apellido: 'Rodríguez',
        grado: grados[i % grados.length]
      }
    });
    alumnos.push(alumno);
  }

  // 4. Inscribir Alumnos (Los primeros 6 a fútbol, otros 4 a ajedrez)
  for (let i = 0; i < 6; i++) {
    await prisma.inscripcion.create({
      data: { alumnoId: alumnos[i].id, clubId: clubFutbol.id }
    });
  }
  for (let i = 6; i < 10; i++) {
    await prisma.inscripcion.create({
      data: { alumnoId: alumnos[i].id, clubId: clubAjedrez.id }
    });
  }

  // 5. Crear una Sesión pasada de prueba (Ej: Clase de ayer)
  const sesionAyer = await prisma.sesion.create({
    data: {
      clubId: clubFutbol.id,
      fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), // Restamos 1 día
      tema: 'Práctica de penales'
    }
  });

  // 6. Asistencia de ayer (3 presentes, 1 ausente, 2 justificados)
  const estados: EstadoAsistencia[] = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'JUSTIFICADO'];
  
  for (let i = 0; i < 6; i++) {
    await prisma.asistencia.create({
      data: {
        sesionId: sesionAyer.id,
        alumnoId: alumnos[i].id,
        estado: estados[i]
      }
    });
  }

  console.log('✅ ¡Seeding completado con éxito!');
  console.log('');
  console.log(`💡 ID Ficticio del profesor (Juan Perez): ${profePerez.id}`);
  console.log(`💡 ID Club Fútbol: ${clubFutbol.id}`);
  console.log(`💡 ID Club Ajedrez: ${clubAjedrez.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
