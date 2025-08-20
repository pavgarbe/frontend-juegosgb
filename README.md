# JuegosGB - Sistema de Entretenimiento Interactivo

Sistema completo de entretenimiento con múltiples juegos interactivos desarrollado con React y Node.js. Incluye funcionalidades de tiempo real, control remoto y gestión de créditos.

## 🏗️ Arquitectura

### Frontend (React + Vite)
- **Framework**: React 18.3.1 con Vite
- **Styling**: TailwindCSS + Bootstrap
- **Estado**: Zustand para manejo de estado global
- **Comunicación**: Socket.io-client para tiempo real
- **Navegación**: React Router DOM
- **Animaciones**: Framer Motion + Lottie React

### Backend (Node.js + Express)
- **Runtime**: Node.js con Express
- **WebSockets**: Socket.io para comunicación en tiempo real
- **Gestión de procesos**: PM2 para producción

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Frontend
```bash
cd frontend-juegosgb

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Backend
```bash
# Ir al directorio del servidor
cd server

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar con PM2 (producción)
npm run start
```

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto frontend:

```env
VITE_APP_SOCKET_URL=http://localhost:3001
VITE_APP_API_URL=http://localhost:3001/api
```

## 🎯 Funcionalidades Principales

### Sistema de Créditos
- Gestión automática de créditos por juego
- Actualización en tiempo real
- Panel de administración para ajustes

### Control Remoto
- Control mediante teclado para navegación
- Soporte para comandos remotos (arriba, abajo, enter)
- Integración con hardware externo

### Comunicación en Tiempo Real
- WebSockets para sincronización instantánea
- Notificaciones push
- Actualizaciones de estado automáticas

### Multimedia
- Reproducción de audio y video
- Soporte para karaoke con archivos CDG
- Efectos sonoros y música de fondo

## 📁 Estructura del Proyecto

```
frontend-juegosgb/
├── public/              # Archivos estáticos
│   ├── audio/          # Efectos de sonido y música
│   └── images/         # Imágenes y recursos gráficos
├── server/             # Servidor Node.js
│   └── src/
│       └── app.js      # Aplicación principal del servidor
├── src/                # Código fuente frontend
│   ├── components/     # Componentes reutilizables
│   ├── utils/          # Utilidades y helpers
│   ├── animations/     # Archivos de animación Lottie
│   └── [Juegos].jsx    # Componentes de cada juego
└── package.json
```

## 🎮 Juegos Disponibles

1. **Super Trivia**: Sistema de preguntas con múltiples niveles
2. **100 Mexicanos**: Juego de encuestas familiares
3. **Adivina la Canción**: Identificación musical
4. **Karaoke**: Sistema completo de karaoke
5. **Juegos de Fuerza**: Simuladores de fuerza
6. **Máquina de Boxeo**: Boxeo virtual
7. **Preguntas Primaria**: Trivia educativa
8. **Vencidas**: Juego de competencia
9. **Toques**: Juego de reacción rápida

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18.3.1
- Vite 6.3.4
- TailwindCSS 3.4.13
- Socket.io-client 4.8.1
- Zustand 4.5.5
- Framer Motion 11.18.2
- React Router DOM 6.26.2

### Backend
- Node.js
- Express 4.19.2
- Socket.io 4.7.5
- PM2 5.3.1

## 🚀 Scripts Disponibles

### Frontend
- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run preview`: Vista previa de la build
- `npm run lint`: Ejecutar linter

### Backend
- `npm run start:dev`: Ejecutar servidor en desarrollo
- `npm run start:staging`: Ejecutar con PM2

## 🔧 Configuración de Desarrollo

1. Asegúrate de que el servidor backend esté ejecutándose en el puerto 3001
2. El frontend se ejecuta por defecto en el puerto 5173
3. Configura las variables de entorno según tu ambiente
4. Los archivos multimedia deben estar en `public/audio/` e `public/images/`

## 📱 Características Especiales

- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **PWA Ready**: Funcionalidades de aplicación web progresiva
- **Real-time Updates**: Actualizaciones instantáneas mediante WebSockets
- **Audio/Video Support**: Reproducción multimedia completa
- **Remote Control**: Control mediante comandos externos

**Versión**: 1.0.0
**Última actualización**: 5 de agosto de 2025
