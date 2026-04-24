const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const docentes = [
  { nombre: "Sebastián", apellido: "Arias", especialidad: "Fotografía Y Cine", dni: null, celular: "937401842", horario: "LUNES-VIERNES 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Rudy", apellido: "López", especialidad: "Música", dni: "73819306", celular: "972132637", horario: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Selene", apellido: "Pacherrez", especialidad: "Danza Moderna", dni: null, celular: "973771915", horario: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Arturo", apellido: "Cabellos", especialidad: "Teatro", dni: "43382752", celular: "945960665", horario: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Andrea", apellido: "Olloque", especialidad: "Ballet", dni: "004743721", celular: "960544119", horario: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM" },
  { nombre: "Jean Pierre", apellido: "Lopez", especialidad: "Fútbol", dni: null, celular: "923820630", horario: "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM" },
  { nombre: "RONY", apellido: "Palacios", especialidad: "Robótica", dni: "72223959", celular: "951694955", horario: "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM" },
  { nombre: "María Julissa", apellido: "Espinosa Huiman", especialidad: "Natación", dni: null, celular: "949783559", horario: "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM" },
  { nombre: "Stephany Carolina", apellido: "Torres Hidalgo", especialidad: "Karate", dni: null, celular: "981922369", horario: "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM" },
  { nombre: "Cesar", apellido: "Cortez", especialidad: "Dibujo y Pintura", dni: "42442932", celular: "948708433", horario: "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "David", apellido: "Flores", especialidad: "Debate y Oratoria", dni: null, celular: "945463866", horario: "Por definir" },
  { nombre: "Thalia", apellido: "García Cruz", especialidad: "GIMNASIA ARTISTICA", dni: "72748039", celular: "941744109", horario: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Arturo", apellido: "Vega Renteria", especialidad: "VOLEY", dni: "47959232", celular: "956729843", horario: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Francis", apellido: "Fosa", especialidad: "CHINO MANDARIN", dni: null, celular: "945086605", horario: "MIE 2:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Manuel Ascencion", apellido: "Robledo Gonzales", especialidad: "AJEDRES", dni: "02850084", celular: "968073629", horario: "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM" },
  { nombre: "KITY", apellido: "SPORT", especialidad: "BASQUET", dni: null, celular: "921384626", horario: "SAB 8:00-12:30 PM / SEMANA POR DEFINIR" },
  { nombre: "Luis", apellido: "Gonzaga", especialidad: "FINANZAS", dni: null, celular: "---", horario: "SAB 8:00 AM-12:30 PM / SEMANA POR DEFINIR" }
];

async function main() {
  console.log("🚀 Iniciando siembra de docentes...");
  let tempCount = 1;

  for (const d of docentes) {
    const finalDni = d.dni || `TEMP${String(tempCount++).padStart(4, '0')}`;
    
    try {
      // 1. Crear o actualizar el Usuario (Profesor)
      const user = await prisma.usuario.upsert({
        where: { dni: finalDni },
        update: {
          nombre: d.nombre,
          apellido: d.apellido,
          celular: d.celular,
          estado: 'Activado'
        },
        create: {
          nombre: d.nombre,
          apellido: d.apellido,
          dni: finalDni,
          celular: d.celular,
          rol: 'PROFESOR',
          password: '123456',
          mustChangePassword: true,
          estado: 'Activado'
        }
      });

      // 2. Crear el Club y asignarle este profesor
      await prisma.club.create({
        data: {
          nombre: d.especialidad,
          descripcion: `Club de ${d.especialidad} dirigido por ${d.nombre} ${d.apellido}`,
          horario: { texto: d.horario },
          profesorId: user.id
        }
      });

      console.log(`✅ Creado: ${d.nombre} ${d.apellido} -> Club: ${d.especialidad}`);
    } catch (error) {
      console.error(`❌ Error con ${d.nombre}:`, error.message);
    }
  }

  console.log("✨ Proceso de siembra finalizado con éxito.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
