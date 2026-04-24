const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const docentes = [
  { nombre: "Sebastián", apellido: "Arias", especialidad: "Fotografía Y Cine", dni: "TEMP0001", celular: "937401842", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-VIE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "Rudy", apellido: "López", especialidad: "Música", dni: "73819306", celular: "972132637", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Selene", apellido: "Pacherrez", especialidad: "Danza Moderna", dni: "TEMP0002", celular: "973771915", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Arturo", apellido: "Cabellos", especialidad: "Teatro", dni: "43382752", celular: "945960665", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Andrea", apellido: "Olloque", especialidad: "Ballet", dni: "004743721", celular: "960544119", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:00",end:"18:00"}, Miércoles: {start:"15:00",end:"18:00"}, Jueves: {start:"15:00",end:"18:00"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM" }},
  { nombre: "Jean Pierre", apellido: "Lopez", especialidad: "Fútbol", dni: "TEMP0003", celular: "923820630", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM" }},
  { nombre: "RONY", apellido: "Palacios", especialidad: "Robótica", dni: "72223959", celular: "951694955", h: { Sábado: {start:"08:00",end:"12:30"}, Jueves: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM" }},
  { nombre: "María Julissa", apellido: "Espinosa Huiman", especialidad: "Natación", dni: "TEMP0004", celular: "949783559", h: { Sábado: {start:"08:00",end:"12:30"}, Domingo: {start:"08:00",end:"12:30"}, texto: "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM" }},
  { nombre: "Stephany Carolina", apellido: "Torres Hidalgo", especialidad: "Karate", dni: "TEMP0005", celular: "981922369", h: { Sábado: {start:"08:00",end:"12:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM" }},
  { nombre: "Cesar", apellido: "Cortez", especialidad: "Dibujo y Pintura", dni: "42442932", celular: "948708433", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "David", apellido: "Flores", especialidad: "Debate y Oratoria", dni: "TEMP0006", celular: "945463866", h: { Sábado: {start:"08:00",end:"12:30"}, texto: "Por definir" }},
  { nombre: "Thalia", apellido: "García Cruz", especialidad: "GIMNASIA ARTISTICA", dni: "72748039", celular: "941744109", h: { Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "Arturo", apellido: "Vega Renteria", especialidad: "VOLEY", dni: "47959232", celular: "956729843", h: { Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "Francis", apellido: "Fosa", especialidad: "CHINO MANDARIN", dni: "TEMP0007", celular: "945086605", h: { Miércoles: {start:"14:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MIE 2:30-5:30 PM / SAB 8:00-12:30 PM" }},
  { nombre: "Manuel Ascencion", apellido: "Robledo Gonzales", especialidad: "AJEDRES", dni: "02850084", celular: "968073629", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM" }},
  { nombre: "KITY", apellido: "SPORT", especialidad: "BASQUET", dni: "TEMP0008", celular: "921384626", h: { Sábado: {start:"08:00",end:"12:30"}, texto: "SAB 8:00-12:30 PM" }},
  { nombre: "Luis", apellido: "Gonzaga", especialidad: "FINANZAS", dni: "TEMP0009", celular: "---", h: { Sábado: {start:"08:00",end:"12:30"}, texto: "SAB 8:00 AM-12:30 PM" }}
];

async function main() {
  console.log("🧹 Iniciando limpieza total de la base de datos...");

  // Borrar en orden para respetar llaves foráneas
  await prisma.notificacion.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.club.deleteMany();
  await prisma.usuario.deleteMany();

  // Reiniciar AUTO_INCREMENT (MySQL)
  await prisma.$executeRaw`ALTER TABLE Usuario AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Club AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Alumno AUTO_INCREMENT = 1`;

  console.log("✨ Base de datos vacía y contadores reiniciados.");

  // 1. Crear Administrador (Roberto Risco) - ID #1
  const admin = await prisma.usuario.create({
    data: {
      nombre: "Roberto",
      apellido: "Risco",
      dni: "71105971",
      celular: "933047882",
      rol: 'ADMINISTRADOR',
      password: '123456',
      mustChangePassword: true,
      estado: 'Activado'
    }
  });
  console.log("👑 Administrador creado con ID #1");

  // 2. Crear Docentes y Clubes correlativos
  for (const d of docentes) {
    const user = await prisma.usuario.create({
      data: {
        nombre: d.nombre,
        apellido: d.apellido,
        dni: d.dni,
        celular: d.celular,
        rol: 'PROFESOR',
        password: '123456',
        mustChangePassword: true,
        estado: 'Activado'
      }
    });

    await prisma.club.create({
      data: {
        nombre: d.especialidad,
        descripcion: `Club de ${d.especialidad} dirigido por ${d.nombre} ${d.apellido}`,
        horario: d.h,
        profesorId: user.id
      }
    });
    console.log(`✅ Creado ID #${user.id}: ${d.nombre} ${d.apellido}`);
  }

  console.log("\n🎊 ¡LIMPIEZA Y RE-SIEMBRA COMPLETADA!");
  console.log("Ahora todo está ordenado del 1 al 18.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
