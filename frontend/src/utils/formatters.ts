/**
 * Utilidades de formateo para el proyecto Clubes Exitus
 */

export function normalizeDay(dia: string): string {
  if (!dia) return '';
  const d = dia.toLowerCase();
  if (d.includes('lun')) return 'Lunes';
  if (d.includes('mar')) return 'Martes';
  if (d.includes('mi') || d.includes('mirc')) return 'Miércoles';
  if (d.includes('jue')) return 'Jueves';
  if (d.includes('vie')) return 'Viernes';
  if (d.includes('s') || d.includes('sba')) return 'Sábado';
  if (d.includes('d') || d.includes('dom')) return 'Domingo';
  return dia;
}

export function formatHorarioShort(horario: any): string {
  if (!horario) return 'Por definir';

  let parsed = horario;
  if (typeof horario === 'string') {
    try {
      parsed = JSON.parse(horario);
    } catch {
      return 'Error horario';
    }
  }

  if (!parsed || typeof parsed !== 'object') return 'Por definir';

  // Si viene del script de siembra con formato texto libre
  if (parsed.texto) return parsed.texto;

  const daysOrdered = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const activeDays = daysOrdered.filter((d) => parsed[d]);

  if (activeDays.length === 0) return 'Sin horario';

  // Agrupar por horario idéntico
  const groups: { hours: string; days: string[] }[] = [];
  activeDays.forEach((day) => {
    const hours = `${parsed[day].start}-${parsed[day].end}`;
    const group = groups.find((g) => g.hours === hours);
    if (group) group.days.push(day);
    else groups.push({ hours, days: [day] });
  });

  return groups
    .map((g) => {
      const daysStr = g.days.map((d) => d.substring(0, 3)).join(',');
      return `${daysStr}: ${g.hours}`;
    })
    .join(' | ');
}

export function formatHorarioFull(horario: any): string {
  if (!horario) return 'Sin horario';
  let h = horario;
  if (typeof h === 'string') {
    try {
      h = JSON.parse(h);
    } catch {
      return 'Horario inválido';
    }
  }
  if (!h || typeof h !== 'object') return 'Sin horario';
  if (h.texto) return h.texto;

  const DIAS_VALIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dias = Object.keys(h).filter((d) => DIAS_VALIDOS.includes(normalizeDay(d)));

  if (dias.length === 0) return 'Sin horario';

  return dias
    .map((d) => {
      const conf = h[d];
      if (!conf || !conf.start) return '';
      const s = conf.start || '';
      const e = conf.end || '';
      return `${d.slice(0, 3)} ${s}-${e}`;
    })
    .filter(Boolean)
    .join(' • ');
}
