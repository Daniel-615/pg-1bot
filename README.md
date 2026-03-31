# 1Bot Block

Una aplicación web para traducir bloques visuales a código Arduino. El proyecto ofrece un entorno drag-and-drop basado en Blockly y genera código compatible con cinco placas diferentes.

## Qué hace

- Permite armar programas con bloques visuales
- Analiza la semántica del flujo de bloques
- Genera código Arduino válido desde los bloques
- Ejecuta tests antes de levantar el servidor de desarrollo

## Placas soportadas

La app tiene soporte para estas placas:

- Arduino Uno
- Arduino Nano
- Arduino Mega
- ESP32
- Codey

## Características principales

- Generación de código para hardware basado en bloques
- Análisis de variables y tipos
- Detecta errores de uso de variables y tipos incompatibles
- Uso de Vite para desarrollo rápido
- Tests con Vitest para validar el comportamiento antes de iniciar el entorno local

## Cómo usar

1. Instala dependencias:
   ```bash
   pnpm install
   ```

2. Ejecuta el entorno de desarrollo:
   ```bash
   pnpm dev
   ```

   El comando `dev` ejecuta primero los tests y luego arranca Vite.

3. Abre `http://localhost:5173` en tu navegador.

## Scripts útiles

- `pnpm dev` — corre los tests y luego inicia el servidor de desarrollo
- `pnpm build` — compila el proyecto para producción
- `pnpm test` — ejecuta la suite de tests con Vitest
- `pnpm lint` — analiza el código con ESLint

## Estructura importante

- `src/` — código fuente principal de la app
- `src/core/` — motor de bloques, análisis semántico y compilación Arduino
- `src/devices/` — registradores y generadores por placa
- `tests/` — pruebas unitarias del análisis y generación de código

## Objetivo

Esta app está pensada para que los usuarios creen programas en un entorno visual y los traduzcan directamente a código Arduino, con soporte para múltiples placas y validación de errores antes de ejecutar.
