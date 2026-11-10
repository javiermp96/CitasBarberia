# 💈 Cheri Barber - Sistema de Gestión y Reserva de Citas

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ECF8E.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Aplicación web moderna, reactiva y completa para la gestión y reserva de citas de barbería y salones de belleza. Desarrollada con **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4** y **Supabase** (Autenticación, Base de Datos PostgreSQL, Row Level Security y Realtime).

---

## ✨ Características Principales

### 👤 Área del Cliente
- **Reserva Inteligente de Citas:** Cálculo dinámico de franjas horarias disponibles según la duración del servicio seleccionado, evitando solapamientos con otras citas y descansos del barbero.
- **Historial y Gestión de Citas:** Vista detallada de citas pasadas y futuras con estados (*Pendiente*, *Confirmada*, *Cancelada*, *Completada*). Cancelación de citas en tiempo real.
- **Perfil de Usuario:** Actualización de nombre y datos personales.
- **Autenticación Segura:** Registro e inicio de sesión gestionado con Supabase Auth.

### ✂️ Panel del Barbero (`ADMIN`)
- **Gestión de Citas:** Lista completa de reservas ordenadas cronológicamente con actualización de estado (*Confirmar* / *Cancelar*) o eliminación.
- **Control de Horarios y Descansos:** Configuración de franjas de disponibilidad y descansos/pausas con actualización reactiva instantánea.
- **Catálogo de Servicios:** Creación, edición y eliminación de servicios con duraciones personalizadas.
- **Notificaciones en Tiempo Real:** Alertas en vivo con campana interactiva y notificaciones push del navegador cuando entra una nueva reserva.
- **Notificaciones por Email:** Integración con EmailJS para recibir un correo ante cada nueva cita o registro.

### 🛡️ Panel del Administrador Global (`SUPERADMIN`)
- **Registro de Auditoría de Accesos:** Historial de inicios de sesión y eventos del sistema con filtrado por fecha.
- **Políticas de Seguridad Estrictas:** RLS (*Row Level Security*) en PostgreSQL para aislar los datos de los usuarios.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React Router v6 |
| **Estilos & UI** | Tailwind CSS v4, Lucide Icons, Sonner (Toasts) |
| **Backend & Base de Datos** | Supabase (PostgreSQL 15+, Auth, Realtime, RLS) |
| **Manejo de Fechas** | Date-fns |
| **Notificaciones por Email** | EmailJS API |

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/javiermp96/CitasBarberia.git
cd CitasBarberia/citas-barberia
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus credenciales de Supabase y EmailJS:
```env
# Conexión con Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# EmailJS (Opcional para avisos por correo)
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_ADMIN_NOTIFICATION_EMAIL=tu_correo@ejemplo.com
```

### 4. Configurar la Base de Datos en Supabase
1. Crea un nuevo proyecto en [Supabase](https://database.new).
2. Ve a la pestaña **SQL Editor** en el panel de control de Supabase.
3. Copia el contenido del archivo [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo.
   - Crea automáticamente todas las tablas: `users`, `services`, `availability`, `appointments`, `access_logs`, `notifications`.
   - Configura las políticas de seguridad RLS y el trigger para nuevos usuarios.
   - Inserta servicios base por defecto.

> [!TIP]
> **Crear tu primer usuario Administrador:**
> Regístrate normalmente desde la aplicación en `/register` y luego en el SQL Editor de Supabase actualiza tu rol:
> ```sql
> UPDATE public.users SET role = 'ADMIN' WHERE email = 'tu_correo@ejemplo.com';
> ```
> O para `SUPERADMIN`:
> ```sql
> UPDATE public.users SET role = 'SUPERADMIN' WHERE email = 'tu_correo@ejemplo.com';
> ```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:5173](http://localhost:5173).

---

## 📂 Estructura del Proyecto

```text
citas-barberia/
├── public/                 # Favicon y recursos estáticos
├── src/
│   ├── app/                # Vistas de módulos específicos
│   │   ├── barber/         # Panel de control del barbero (Dashboard)
│   │   ├── book/           # Flujo de reserva de citas y 'Mis Citas'
│   │   ├── profile/        # Formulario de perfil de usuario
│   │   ├── superadmin/     # Panel de auditoría de accesos
│   │   └── globals.css     # Variables de color y temas Tailwind v4
│   ├── components/         # Componentes UI reutilizables y Navbar
│   ├── lib/                # Inicialización de Supabase y utilidades
│   ├── pages/              # Páginas de enrutamiento (Home, Login, Register, etc.)
│   ├── services/           # Lógica de llamadas a API, Auth y Supabase
│   ├── App.tsx             # Configuración de rutas (React Router)
│   └── main.tsx            # Punto de entrada de la SPA
├── supabase/
│   └── schema.sql          # Script SQL completo de la base de datos
├── .env.example            # Plantilla de variables de entorno
└── package.json            # Dependencias y scripts del proyecto
```

---

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con Hot Module Replacement (HMR).
- `npm run build`: Valida tipos de TypeScript y compila la aplicación para producción en `/dist`.
- `npm run preview`: Previsualiza localmente el paquete de producción generado.
- `npm run lint`: Ejecuta ESLint sobre el código TypeScript/React.

---

## 🌐 Despliegue en Producción

Puedes desplegar este frontend en cualquier servicio de hosting estático (Vercel, Netlify, Cloudflare Pages):

1. Conecta el repositorio de GitHub a tu plataforma de hosting preferida.
2. Configura los comandos de build:
   - **Root directory:** `citas-barberia`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Agrega las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) en la configuración del panel de hosting.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.
