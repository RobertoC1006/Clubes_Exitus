# Clubes Exitus - Plataforma de Gestión (v2.5 Dockerized)

Plataforma integral para la gestión de clubes escolares, asistencia y pagos. Este proyecto está diseñado como una PWA (Progressive Web App) con un backend en NestJS y un frontend moderno en React, todo orquestado con Docker.

---

## 🚀 Guía de Inicio Rápido (Recomendado)

La forma más sencilla de ejecutar este proyecto es utilizando **Docker Compose**. Esto levantará la base de datos, el backend y el frontend automáticamente en contenedores aislados.

### Requisitos Previos
- **Docker Desktop** instalado y en ejecución. (Descargar en: [docker.com](https://www.docker.com/products/docker-desktop/))
- **Git** instalado.

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
   *Nota: La primera vez puede tardar unos minutos mientras se descargan las imágenes y se compila el código.*

3. **Acceder a la aplicación:**
   - **Plataforma (Frontend):** [http://localhost:5173](http://localhost:5173)
   - **Servidor (API Backend):** [http://localhost:5173/api](http://localhost:5173/api)

---

## 👥 Credenciales de Prueba (Seeding Automático)

El sistema incluye datos de prueba precargados para facilitar la navegación por los diferentes portales:

| Rol | Usuario / DNI | Contraseña | ¿Qué puede hacer? |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Gestión de clubes, usuarios, pagos y estadísticas globales. |
| **Profesor** | `profesor` | `profesor123` | Toma de asistencia, historial de sesiones y su propio dashboard. |
| **Padre** | `padre` | `padre123` | Ver clubes inscritos de su hijo, subir comprobantes de pago y avisos. |

---

## 🛠️ Desarrollo Manual (Sin Docker)

Si deseas ejecutar los servicios de forma local por separado:

1. **Base de Datos:** Inicia MySQL y crea una base llamada `clubes_exitus`.
2. **Backend:**
   ```bash
   cd backend
   npm install
   # Configura el archivo .env con tu DATABASE_URL
   npx prisma migrate dev
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📦 Estructura del Proyecto

```text
Clubes_Exitus/
├── docker-compose.yml       # Orquestación de contenedores
├── README.md                # Esta guía
├── backend/                 # API NestJS + Prisma
│   ├── Dockerfile
│   └── entrypoint.sh        # Script automatizado para DB y Migraciones
└── frontend/                # App React + Vite
    ├── Dockerfile
    └── nginx.conf           # Proxy inverso para la API
```

---

## ⚠️ Solución de Problemas (Troubleshooting)

- **Error en el Backend (Prisma):** El script `entrypoint.sh` espera automáticamente a que MySQL esté listo y ejecuta las migraciones. Si falla, prueba con `docker compose down -v` y vuelve a subir el entorno.
- **Cambios en el Código:** Si realizas cambios en el código y no se reflejan en Docker, usa `docker compose up --build` para forzar la recompilación de las imágenes.
- **Puertos Ocupados:** Asegúrate de que los puertos `5173` y `3306` no estén siendo usados por otras aplicaciones locales.

---

## ✨ Tecnologías Utilizadas

- **Frontend:** React, Vite, Lucide Icons, Vanilla CSS (Premium Design).
- **Backend:** NestJS, Prisma ORM, MySQL.
- **Infraestructura:** Docker, Nginx.
