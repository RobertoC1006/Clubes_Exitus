const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mappingHorarios = {
  "LUNES-VIERNES 3:30-5:30 PM / SAB 8:00 AM-12:30 PM": {
    "Lunes": { "start": "15:30", "end": "17:30" },
    "Martes": { "start": "15:30", "end": "17:30" },
    "Miércoles": { "start": "15:30", "end": "17:30" },
    "Jueves": { "start": "15:30", "end": "17:30" },
    "Viernes": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "LUNES-VIERNES 3:30-5:30 PM / SAB 8:00 AM-12:30 PM"
  },
  "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM": {
    "Martes": { "start": "15:30", "end": "17:30" },
    "Jueves": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM"
  },
  "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM": {
    "Martes": { "start": "15:00", "end": "18:00" },
    "Jueves": { "start": "15:00", "end": "18:00" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM"
  },
  "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM": {
    "Martes": { "start": "15:30", "end": "17:30" },
    "Viernes": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM"
  },
  "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM": {
    "Jueves": { "start": "15:30", "end": "17:30" },
    "Viernes": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM"
  },
  "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM": {
    "Sábado": { "start": "08:00", "end": "12:30" },
    "Domingo": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM"
  },
  "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM": {
    "Miércoles": { "start": "15:30", "end": "17:30" },
    "Jueves": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM"
  },
  "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM": {
    "Lunes": { "start": "15:30", "end": "17:30" },
    "Martes": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM"
  },
  "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM": {
    "Martes": { "start": "15:30", "end": "17:30" },
    "Jueves": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM"
  },
  "MIE 2:30-5:30 PM / SAB 8:00 AM-12:30 PM": {
    "Miércoles": { "start": "14:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "MIE 2:30-5:30 PM / SAB 8:00 AM-12:30 PM"
  },
  "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM": {
    "Lunes": { "start": "15:30", "end": "17:30" },
    "Miércoles": { "start": "15:30", "end": "17:30" },
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM"
  },
  "SAB 8:00-12:30 PM / SEMANA POR DEFINIR": {
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00-12:30 PM / SEMANA POR DEFINIR"
  },
  "SAB 8:00 AM-12:30 PM / SEMANA POR DEFINIR": {
    "Sábado": { "start": "08:00", "end": "12:30" },
    "texto": "SAB 8:00 AM-12:30 PM / SEMANA POR DEFINIR"
  }
};

const docentes = [
  { nombre: "Sebastián", apellido: "Arias", especialidad: "Fotografía Y Cine", dni: null, celular: "937401842", horarioText: "LUNES-VIERNES 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Rudy", apellido: "López", especialidad: "Música", dni: "73819306", celular: "972132637", horarioText: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Selene", apellido: "Pacherrez", especialidad: "Danza Moderna", dni: null, celular: "973771915", horarioText: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Arturo", apellido: "Cabellos", especialidad: "Teatro", dni: "43382752", celular: "945960665", horarioText: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" },
  { nombre: "Andrea", apellido: "Olloque", especialidad: "Ballet", dni: "004743721", celular: "960544119", horarioText: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM" },
  { nombre: "Jean Pierre", apellido: "Lopez", especialidad: "Fútbol", dni: null, celular: "923820630", horarioText: "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM" },
  { nombre: "RONY", apellido: "Palacios", especialidad: "Robótica", dni: "72223959", celular: "951694955", horarioText: "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM" },
  { nombre: "María Julissa", apellido: "Espinosa Huiman", especialidad: "Natación", dni: null, celular: "949783559", horarioText: "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM" },
  { nombre: "Stephany Carolina", apellido: "Torres Hidalgo", especialidad: "Karate", dni: null, celular: "981922369", horarioText: "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM" },
  { nombre: "Cesar", apellido: "Cortez", especialidad: "Dibujo y Pintura", dni: "42442932", celular: "948708433", horarioText: "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "David", apellido: "Flores", especialidad: "Debate y Oratoria", dni: null, celular: "945463866", horarioText: "Por definir" },
  { nombre: "Thalia", apellido: "García Cruz", especialidad: "GIMNASIA ARTISTICA", dni: "72748039", celular: "941744109", horarioText: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Arturo", apellido: "Vega Renteria", especialidad: "VOLEY", dni: "47959232", celular: "956729843", horarioText: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Francis", apellido: "Fosa", especialidad: "CHINO MANDARIN", dni: null, celular: "945086605", horarioText: "MIE 2:30-5:30 PM / SAB 8:00 AM-12:30 PM" },
  { nombre: "Manuel Ascencion", apellido: "Robledo Gonzales", especialidad: "AJEDRES", dni: "02850084", celular: "968073629", horarioText: "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM" },
  { nombre: "KITY", apellido: "SPORT", especialidad: "BASQUET", dni: null, celular: "921384626", horarioText: "SAB 8:00-12:30 PM / SEMANA POR DEFINIR" },
  { nombre: "Luis", apellido: "Gonzaga", especialidad: "FINANZAS", dni: null, celular: "---", horarioText: "SAB 8:00 AM-12:30 PM / SEMANA POR DEFINIR" }
];

async function main() {
  console.log("🚀 Iniciando siembra de docentes corregida...");
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

      // 2. Determinar el objeto de horario
      let horarioFinal = { texto: d.horarioText };
      if (mappingHorarios[d.horarioText]) {
        horarioFinal = mappingHorarios[d.horarioText];
      }

      // 3. Crear el Club y asignarle este profesor
      await prisma.club.create({
        data: {
          nombre: d.especialidad,
          descripcion: `Club de ${d.especialidad} dirigido por ${d.nombre} ${d.apellido}`,
          horario: horarioFinal,
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
