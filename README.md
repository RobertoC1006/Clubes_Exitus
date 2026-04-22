# Clubes Exitus - Plataforma de Gestión (v2.5 Dockerized) 🚀

Plataforma integral para la gestión de clubes escolares, asistencia y pagos. Este proyecto está diseñado como una PWA (Progressive Web App) con un backend en NestJS y un frontend moderno en React, todo orquestado con Docker para una implementación sin complicaciones.

---

## ⚡ Guía de Inicio Rápido (Recomendado)

La forma más sencilla de ejecutar este proyecto es utilizando **Docker Compose**. Esto levantará la base de datos (MySQL 8.0), el backend y el frontend automáticamente.

### Requisitos Previos
- **Docker Desktop** instalado y en ejecución.
- **Git** para clonar el proyecto.

### Pasos para Ejecutar:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-de-tu-repositorio>
   cd Clubes_Exitus
   ```

2. **Levantar todos los servicios:**
   ```bash
   docker compose up --build
   ```
   *Nota: La primera vez puede tardar unos minutos. El backend esperará automáticamente a que la base de datos esté lista para aplicar el esquema y cargar los datos de prueba.*

3. **Acceder a la aplicación:**
   - **Plataforma (Frontend/PWA):** [http://localhost:5173](http://localhost:5173)
   - **API (Backend - vía Proxy):** [http://localhost:5173/api](http://localhost:5173/api)

---

## 🔑 Credenciales de Acceso (Datos Semilla)

El sistema viene con una base de datos precargada (Seed) con perfiles de prueba. Usa el **DNI** como usuario:

| Rol | Usuario (DNI) | Contraseña | Perfil de Prueba |
| :--- | :--- | :--- | :--- |
| **Administrador** | `ADM-001` | `admin123` | Carlos Mendoza (Director) |
| **Profesor** | `PROF-001` | `prof123` | Juan Perez (Fútbol/Ajedrez) |
| **Padre** | `PAD-001` | `padre123` | Alberto Benitez |

*También puedes probar con `PROF-002`/`prof123` o `PAD-002`/`padre123` para ver diferentes datos.*

---

## 🏗️ Arquitectura Docker

- **MySQL-DB**: Base de datos persistente en un volumen persistente.
- **Backend (NestJS)**: Corre en el puerto interno 3000. Usa `prisma db push` para sincronizar el esquema automáticamente en cada inicio.
- **Frontend (React + Vite + Nginx)**: Expuesto en el puerto **5173**. Nginx actúa como proxy inverso, redirigiendo todas las peticiones a `/api/*` directamente al contenedor del backend.

---

## 🛠️ Desarrollo Manual (Sin Docker)

Si prefieres ejecutarlo nativamente para desarrollo rápido:

1. **Base de Datos:** Inicia MySQL y crea la DB `clubes_exitus`.
2. **Backend:**
   ```bash
   cd backend
   npm install
   # Configura el archivo .env con tu DATABASE_URL
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## ⚠️ Solución de Problemas (Troubleshooting)

- **¿No conecta a la DB?**: Asegúrate de que el puerto `3306` local no esté ocupado por otro MySQL. Si es así, apaga tu MySQL local o cambia el mapeo en `docker-compose.yml`.
- **Limpieza Total**: Si los datos parecen corruptos o quieres reiniciar el seed, usa:
  `docker compose down -v` (esto borrará el volumen de la DB) y luego sube de nuevo.
- **Logs en tiempo real**: Para ver qué está haciendo el backend durante el inicio:
  `docker compose logs -f backend`

---

## ✨ Tecnologías Utilizadas

- **Core:** React 18, NestJS 11, Prisma ORM.
- **Styling:** Vanilla CSS con estética Premium (Glassmorphism, Bento Grid).
- **Icons:** Lucide React.
- **Infraestructura:** Docker, Docker Compose, Nginx.
