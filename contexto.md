# 🧾 📚 CONTEXTO DE LA PROBLEMÁTICA Y PROYECTO

Sistema web mobile (PWA) para gestionar la asistencia, pagos, e información de clubes extracurriculares (ajedrez, fútbol, lectura, etc.) de manera centralizada y organizada.

---

# 🧩 📋 MÓDULOS Y FUNCIONALIDADES

## 🔐 1. MÓDULO DE AUTENTICACIÓN (LOGIN)
* **Funcionalidad:** Restringir el acceso según el rol (Administrador, Profesor, Padre).
* **Características Clave:** 
  * Sesiones persistentes (para no tener que iniciar sesión todos los días).
  * JWT Tokens en el Frontend / LocalStorage.
  * *Estrategia posterior:* Autenticación simplificada para padres (ej. DNI o Magic Link) para reducir fricción.

## ✅ 2. MÓDULO DE ASISTENCIA
* Lista digital de alumnos por club.
* Registro manual de asistencia (Presente, Ausente, Justificado).
* **Características:** Uso desde celular, funciona **Offline** y se sincroniza automáticamente.

## 💰 3. MÓDULO DE PAGOS
* Subida de comprobante (imagen) por parte del padre.
* Registro y Validación manual por el administrador.
* Estados: Pendiente, Pagado, Rechazado.

## 👨👩👧👦 4. MÓDULO DE PADRES
* Ver asistencia de su hijo y su historial.
* Ver estado de pagos y subir comprobantes.

## 📊 5. MÓDULO ADMINISTRADOR
* Visualizar asistencia por club, validar pagos, ver reportes generales.

---

# 🧠 🧱 STACK TECNOLÓGICO Y ARQUITECTURA
* **Frontend:** React, TypeScript, Vite, PWA (Offline en asistencia).
* **Backend:** Node.js, NestJS.
* **Base de Datos:** MySQL, Prisma.
* **Infraestructura:** Docker.
