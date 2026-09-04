## Pasos para ejecutar las pruebas unitarias
Primero debemos descargar el proyecto para esto
git clone https://github.com/Daniel-615/pg-1bot.git
git pull origin tests/playwright
pnpm install 

## Prueba 1 Login exitoso
pnpm exec playwright test tests/auth/login.spec.ts

## Prueba 2 Login fallido
pnpm exec playwright test tests/auth/login.fail.spec.ts

## Prueba 3 Redirección a la pantalla principal
pnpm exec playwright test tests/home.spec.ts

## Prueba 4 Arrastrar y soltar bloques
pnpm exec playwright test tests/workspace/drag-drop.spec.ts

## Prueba 5 Traducción de bloques a arduino
pnpm exec playwright test tests/workspace/translation.spec.ts

## Prueba 7 Validación endpoint de puertos arduino
pnpm exec playwright test tests/api/ports.spec.ts

## Prueba 8 Cerrar sesión
pnpm exec playwright test tests/auth/logout.spec.ts

## Prueba 9 Exportar archivo arduino .ino
pnpm exec playwright test tests/export.spec.ts
