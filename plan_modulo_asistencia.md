# 📅 Plan de Implementación: Módulo de Asistencia

Basado en el requerimiento de desarrollar una PWA con capacidad offline para la toma de asistencia, proponemos dividir la construcción del **Módulo de Asistencia** en 4 capas conceptuales (Base de Datos, Backend, Frontend Online, e Infraestructura Offline).

---

## 1. 🗄️ Capa de Datos (MySQL con Docker & Prisma)

La base de datos MySQL estará alojada en un contenedor **Docker** (ya configurado en `docker-compose.yml`) para mantener el entorno limpio y aislado. 
Utilizaremos **Prisma** como ORM (gestor) para definir y administrar las siguientes entidades base dentro del código:

* **`Usuario`**: (Profesores, Administradores, Padres)
* **`Club`**: (Ajedrez, Fútbol, etc.)
* **`Alumno`**: Datos del alumno.
* **`Inscripcion` (o `ClubAlumno`)**: Tabla intermedia que indica qué alumno está en qué club.
* **`Sesion`**: Representa una clase o sesión de un club en una fecha y hora específica.
* **`Asistencia`**: Registro por alumno en una sesión. Contendrá estados: `PRESENTE`, `AUSENTE`, `JUSTIFICADO`.

## 2. ⚙️ Capa de Backend (NestJS)

> **💡 Nota sobre Autenticación:** Dado que el Login se implementará al final, **simularemos ("mockearemos")** la sesión de un Profesor en esta etapa. El sistema asumirá temporalmente un `profesorId` fijo para relacionar las asistencias, saltando las restricciones de seguridad JWT por ahora.

Crearemos los endpoints esenciales asegurando que estén optimizados para recibir envíos en lote (luego esto servirá para la sincronización offline).

* **`GET /clubes/:clubId/alumnos`**: Obtiene los alumnos inscritos para guardarlos en la caché local del profesor.
* **`GET /sesiones?clubId=X`**: Historial de sesiones de un club.
* **`POST /sesiones`**: Abrir una nueva sesión para pasar lista de hoy.
* **`PUT /sesiones/:sessionId/asistencia`**: Guardar/Actualizar la lista completa de asistencias en un solo llamado.
* **`POST /sync/asistencia`** *(Endpoint especial Offline)*: Para recibir múltiples sesiones y asistencias acumuladas si el profesor estuvo varios días sin conexión.

## 3. 📱 Capa de Frontend - Vistas (React + Vite)

Dado que es Mobile First (PWA), las pantallas deben ser amigables para el celular del profesor:

1. **Dashboard de Mis Clubes**: Lista de los clubes asignados al profesor con tarjetas grandes.
2. **Historial del Club**: Lista de clases pasadas y un gran FAB (Floating Action Button) de "Tomar Asistencia Hoy".
3. **Pantalla de Toma de Asistencia (Mobile)**:
   * Lista de alumnos estilo "tarjeta" o fila.
   * Controles rápidos (Toggle switch o 3 botones semaforizados: 🟢 Presente, 🔴 Ausente, 🟡 Justificado).
   * Guardado rápido con feedback visual.

## 4. 📴 Capa Offline (PWA + Service Worker)

Esta es la funcionalidad clave. Usaremos almacenamiento local y un service worker:

* **Tecnología sugerida**: `Dexie.js` (un wrapper de IndexedDB fácil de usar en React) o `Zustand con persistencia`.
* **Flujo Offline**:
   1. Cuando hay internet, la app descarga y guarda en `IndexedDB` a los alumnos y los clubes del profesor (Caché inicial).
   2. El profesor inicia una sesión de asistencia en la cancha de fútbol sin internet.
   3. Marca presencias/ausencias. Al darle "Guardar", la app detecta que no hay red (`navigator.onLine === false`).
   4. Los registros se guardan en IndexedDB con el estado `Status: PENDING_SYNC`.
   5. Aparece un icono de "Sincronización pendiente" 🔄.
   6. Al volver la señal wifi (o con un botón "Sincronizar ahora"), la App envía los datos acumulados al backend.

---

## 🚀 Fases de Desarrollo Sugeridas

**✅ Fase 0: Infraestructura (Completado)**: Archivo `docker-compose.yml` creado para levantar la DB virtualizada.

1. **Fase 1**: Definir y ejecutar el esquema de Prisma en la base de datos Docker.
2. **Fase 2**: Crear cascarón del Backend (NestJS) y Endpoints Básicos (con el ID del profesor mockeado).
3. **Fase 3**: Crear UI del Frontend (React/PWA) con Mock Data (pantallas de asistencia).
4. **Fase 4**: Conectar Frontend y Backend de forma Online ("Happy path").
5. **Fase 5**: Añadir la lógica Offline (IndexedDB) y encolamiento de datos en PWA.

¿Estás de acuerdo con este nuevo flujo? Para iniciar oficialmente la **Fase 1**, puedo proponerte la estructura exacta del esquema Prisma (`schema.prisma`) para que generemos tus tablas.
