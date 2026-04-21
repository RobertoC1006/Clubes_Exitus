# Clubes Exitus - Plataforma de Gestión

Plataforma integral para la gestión de clubes escolares, asistencia y pagos. Este proyecto está diseñado como una PWA (Progressive Web App) con un backend robusto en NestJS y un frontend moderno en React.

## 🚀 Inicio Rápido (Docker)

La forma más sencilla de ejecutar todo el proyecto es utilizando **Docker Compose**. Esto levantará la base de datos, el backend y el frontend automáticamente.

### Requisitos Previos
- Docker Desktop instalado y corriendo.
- Git (opcional, para clonar).

### Pasos para ejecutar:

1. **Clonar el repositorio** (si aún no lo has hecho):
   ```bash
   git clone <url-del-repositorio>
   cd Clubes_Exitus
   ```

2. **Levantar los servicios:**
   ```bash
   docker compose up --build
   ```

3. **Acceder a la aplicación:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend (API):** [http://localhost:5173/api](http://localhost:5173/api)

---

## 🛠️ Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios manualmente para desarrollo:

### 1. Base de Datos (MySQL)
Necesitas una instancia de MySQL corriendo con una base de datos llamada `clubes_exitus`. Puedes usar la imagen de docker solo para la DB:
```bash
docker compose up mysql-db -d
```

### 2. Backend (NestJS)
```bash
cd backend
npm install
# Configura tu .env basado en la URL de tu base de datos
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Credenciales de Prueba

El sistema incluye un proceso de *seeding* automático con los siguientes usuarios de prueba:

| Rol | DNI / Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` |
| **Profesor** | `profesor` | `profesor123` |
| **Padre** | `padre` | `padre123` |

---

## 🏗️ Arquitectura del Proyecto

- **Backend:** NestJS, Prisma ORM, MySQL.
- **Frontend:** React (Vite), Lucide Icons, Vanilla CSS (Premium Design System).
- **Infraestructura:** Docker, Nginx (Reverse Proxy).

---

## 📝 Notas de Versión
- **v2.5:** Dockerización completa y centralización de API.
- **v2.0:** Rediseño Premium con Bento Grid y Glassmorphism.
- **v1.0:** Funcionalidades base de asistencia y pagos.
