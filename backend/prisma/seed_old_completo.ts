import { PrismaClient, EstadoAsistencia, RolUsuario } from '@prisma/client';

const prisma = new PrismaClient();

function diasAtras(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

async function seedSesiones(
  club: { id: number },
  alumnosList: any[],
  diasCount: number,
  tasaPresencia = 0.85
) {
  for (let i = diasCount; i >= 1; i--) {
    const sesion = await prisma.sesion.create({
      data: { clubId: club.id, fecha: diasAtras(i) },
    });
    for (const alumno of alumnosList) {
      const rand = Math.random();
      let estado: EstadoAsistencia;
      if (rand < tasaPresencia) {
        estado = EstadoAsistencia.PRESENTE;
      } else if (rand < tasaPresencia + 0.08) {
        estado = EstadoAsistencia.JUSTIFICADO;
      } else {
        estado = EstadoAsistencia.AUSENTE;
      }
      await prisma.asistencia.create({
        data: { sesionId: sesion.id, alumnoId: alumno.id, estado },
      });
    }
  }
}

async function main() {
  /* 
  await prisma.asistencia.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.club.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('🗑️  Base de datos limpiada.');
  */

  // 1. ADMINISTRADOR
  const director = await prisma.usuario.create({
    data: { nombre: 'Carlos', apellido: 'Mendoza Ríos', email: 'director@exitus.edu', password: 'admin123', rol: RolUsuario.ADMINISTRADOR, dni: 'ADM-001' },
  });

  // 2. PROFESORES
  const profJuan = await prisma.usuario.create({
    data: { nombre: 'Juan', apellido: 'Perez García', email: 'jperez@exitus.edu', password: 'prof123', rol: RolUsuario.PROFESOR, dni: 'PROF-001' },
  });
  const profMariana = await prisma.usuario.create({
    data: { nombre: 'Mariana', apellido: 'López Torres', email: 'mlopez@exitus.edu', password: 'prof123', rol: RolUsuario.PROFESOR, dni: 'PROF-002' },
  });
  const profRicardo = await prisma.usuario.create({
    data: { nombre: 'Ricardo', apellido: 'Suárez Vega', email: 'rsuarez@exitus.edu', password: 'prof123', rol: RolUsuario.PROFESOR, dni: 'PROF-003' },
  });
  console.log('✅  Director + 3 Profesores creados.');

  // 3. PADRES
  const padreAlberto = await prisma.usuario.create({
    data: { nombre: 'Alberto', apellido: 'Benitez Ríos', email: 'abenitez@gmail.com', password: 'padre123', rol: RolUsuario.PADRE, dni: 'PAD-001' },
  });
  const madreSilvia = await prisma.usuario.create({
    data: { nombre: 'Silvia', apellido: 'Morales Cruz', email: 'smorales@gmail.com', password: 'padre123', rol: RolUsuario.PADRE, dni: 'PAD-002' },
  });
  const padreMiguel = await prisma.usuario.create({
    data: { nombre: 'Miguel', apellido: 'Fernandez Ruiz', email: 'mfernandez@gmail.com', password: 'padre123', rol: RolUsuario.PADRE, dni: 'PAD-003' },
  });
  const madreLuisa = await prisma.usuario.create({
    data: { nombre: 'Luisa', apellido: 'Castro Medina', email: 'lcastro@gmail.com', password: 'padre123', rol: RolUsuario.PADRE, dni: 'PAD-004' },
  });
  console.log('✅  4 Padres de familia creados.');

  // 4. CLUBES
  const clubFutbol = await prisma.club.create({
    data: { nombre: 'Fútbol Selección', descripcion: 'Equipo representativo de la institución.', profesorId: profJuan.id },
  });
  const clubAjedrez = await prisma.club.create({
    data: { nombre: 'Taller de Ajedrez', descripcion: 'Club de estrategia y pensamiento lógico.', profesorId: profJuan.id },
  });
  const clubDanza = await prisma.club.create({
    data: { nombre: 'Danza Contemporánea', descripcion: 'Expresión artística y coreografía moderna.', profesorId: profMariana.id },
  });
  const clubRobotica = await prisma.club.create({
    data: { nombre: 'Robótica e IA', descripcion: 'Programación, Arduino e Inteligencia Artificial.', profesorId: profRicardo.id },
  });
  console.log('✅  4 Clubes creados.');

  // 5. ALUMNOS
  const alejandro: any = await prisma.alumno.create({ data: { nombre: 'Alejandro', apellido: 'Benitez Ríos', grado: '10º A', padreId: padreAlberto.id } });
  const sofia: any = await prisma.alumno.create({ data: { nombre: 'Sofia', apellido: 'Benitez Ríos', grado: '8º B', padreId: padreAlberto.id } });
  const valentina: any = await prisma.alumno.create({ data: { nombre: 'Valentina', apellido: 'Morales Cruz', grado: '10º A', padreId: madreSilvia.id } });
  const diego: any = await prisma.alumno.create({ data: { nombre: 'Diego', apellido: 'Fernandez Ruiz', grado: '9º A', padreId: padreMiguel.id } });
  const gabriel: any = await prisma.alumno.create({ data: { nombre: 'Gabriel', apellido: 'Fernandez Ruiz', grado: '10º B', padreId: padreMiguel.id } });
  const isabella: any = await prisma.alumno.create({ data: { nombre: 'Isabella', apellido: 'Castro Medina', grado: '11º A', padreId: madreLuisa.id } });
  const mateo: any = await prisma.alumno.create({ data: { nombre: 'Mateo', apellido: 'Rodríguez Silva', grado: '10º A' } });
  const camila: any = await prisma.alumno.create({ data: { nombre: 'Camila', apellido: 'Gómez León', grado: '9º B' } });
  const sebastian: any = await prisma.alumno.create({ data: { nombre: 'Sebastián', apellido: 'Torres Vega', grado: '11º A' } });
  const daniela: any = await prisma.alumno.create({ data: { nombre: 'Daniela', apellido: 'Herrera Paz', grado: '8º A' } });
  console.log('✅  10 Alumnos creados.');

  // 6. INSCRIPCIONES
  await prisma.inscripcion.createMany({
    data: [
      { alumnoId: alejandro.id, clubId: clubFutbol.id },
      { alumnoId: diego.id, clubId: clubFutbol.id },
      { alumnoId: gabriel.id, clubId: clubFutbol.id },
      { alumnoId: mateo.id, clubId: clubFutbol.id },
      { alumnoId: sebastian.id, clubId: clubFutbol.id },
      { alumnoId: camila.id, clubId: clubFutbol.id },
      { alumnoId: valentina.id, clubId: clubAjedrez.id },
      { alumnoId: sofia.id, clubId: clubAjedrez.id },
      { alumnoId: daniela.id, clubId: clubAjedrez.id },
      { alumnoId: isabella.id, clubId: clubAjedrez.id },
      { alumnoId: valentina.id, clubId: clubDanza.id },
      { alumnoId: camila.id, clubId: clubDanza.id },
      { alumnoId: sofia.id, clubId: clubDanza.id },
      { alumnoId: daniela.id, clubId: clubDanza.id },
      { alumnoId: gabriel.id, clubId: clubRobotica.id },
      { alumnoId: alejandro.id, clubId: clubRobotica.id },
      { alumnoId: sebastian.id, clubId: clubRobotica.id },
      { alumnoId: mateo.id, clubId: clubRobotica.id },
    ],
  });
  console.log('✅  Inscripciones creadas.');

  // 7. SESIONES + HISTORIAL
  await seedSesiones(clubFutbol, [alejandro, diego, gabriel, mateo, sebastian, camila], 15, 0.88);
  await seedSesiones(clubAjedrez, [valentina, sofia, daniela, isabella], 12, 0.92);
  await seedSesiones(clubDanza, [valentina, camila, sofia, daniela], 10, 0.80);
  await seedSesiones(clubRobotica, [gabriel, alejandro, sebastian, mateo], 10, 0.75);
  console.log('✅  47 días de historial sembrados.');

  console.log(`
🚀  BASE DE DATOS LISTA
    👑  Admin: ${director.nombre} ${director.apellido} (ID: ${director.id})
    🍎  Profesores: ${profJuan.nombre}, ${profMariana.nombre}, ${profRicardo.nombre}
    👪  Padres: ${padreAlberto.nombre}, ${madreSilvia.nombre}, ${padreMiguel.nombre}, ${madreLuisa.nombre}
    🎒  10 Alumnos activos en 4 Clubes
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
