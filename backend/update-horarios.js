const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { nombre: "Fotografía Y Cine", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-VIE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "Música", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Danza Moderna", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Teatro", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:30-5:30 PM" }},
  { nombre: "Ballet", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:00",end:"18:00"}, Miércoles: {start:"15:00",end:"18:00"}, Jueves: {start:"15:00",end:"18:00"}, texto: "SAB 8:00 AM-12:30 PM / MAR-JUE 3:00-6:00 PM" }},
  { nombre: "Fútbol", h: { Sábado: {start:"08:00",end:"12:30"}, Martes: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MAR-VIE 3:30-5:30 PM" }},
  { nombre: "Robótica", h: { Sábado: {start:"08:00",end:"12:30"}, Jueves: {start:"15:30",end:"17:30"}, Viernes: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / JUE-VIE 3:30-5:30 PM" }},
  { nombre: "Natación", h: { Sábado: {start:"08:00",end:"12:30"}, Domingo: {start:"08:00",end:"12:30"}, texto: "SAB 8:00 AM-12:30 PM / DOM 8:00 AM-12:30 PM" }},
  { nombre: "Karate", h: { Sábado: {start:"08:00",end:"12:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, texto: "SAB 8:00 AM-12:30 PM / MIE-JUE 3:30-5:30 PM" }},
  { nombre: "Dibujo y Pintura", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-MAR 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "GIMNASIA ARTISTICA", h: { Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "VOLEY", h: { Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Jueves: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MAR-JUE 3:30-5:30 PM / SAB 8:00 AM-12:30 PM" }},
  { nombre: "CHINO MANDARIN", h: { Miércoles: {start:"14:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "MIE 2:30-5:30 PM / SAB 8:00-12:30 PM" }},
  { nombre: "AJEDRES", h: { Lunes: {start:"15:30",end:"17:30"}, Martes: {start:"15:30",end:"17:30"}, Miércoles: {start:"15:30",end:"17:30"}, Sábado: {start:"08:00",end:"12:30"}, texto: "LUN-MIE 3:30-5:30 PM / SAB 8:00-12:30 PM" }},
  { nombre: "BASQUET", h: { Sábado: {start:"08:00",end:"12:30"}, texto: "SAB 8:00-12:30 PM" }},
  { nombre: "FINANZAS", h: { Sábado: {start:"08:00",end:"12:30"}, texto: "SAB 8:00-12:30 PM" }}
];

async function main() {
  console.log("🛠️ Actualizando horarios estructurados...");
  for (const item of updates) {
    const club = await prisma.club.findFirst({ where: { nombre: item.nombre } });
    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { horario: item.h }
      });
      console.log(`✅ Horario actualizado para: ${item.nombre}`);
    }
  }
  console.log("✨ Proceso terminado.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
