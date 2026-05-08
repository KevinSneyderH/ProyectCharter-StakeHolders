# Project Charter — Formulario React (Bun)

Formulario multi-paso para que los estudiantes llenen el Project Charter.

## Stack
- **Bun 1.x** — runtime, package manager y task runner
- **React 19** + **TypeScript 6**
- **Tailwind CSS 4** — via plugin de Vite (sin tailwind.config.js)
- **Vite 8**, **React Hook Form 7**, **Zod 4**

## Inicio rápido

```bash
npm install -g bun   # si no tienes Bun
bun install          # instalar dependencias (~300ms con caché)
bun dev              # servidor de desarrollo
bun run build        # build de producción
bun preview          # preview del build
```

## Por qué Bun vs npm

| | npm | Bun |
|---|---|---|
| install frío | ~15 s | ~2 s |
| install con caché | ~4 s | ~300 ms |
| Scripts dev/build | Node.js | Bun runtime nativo |
| Lockfile | package-lock.json | bun.lock |

## Diferencia clave: Tailwind v4

Sin `tailwind.config.js` ni `postcss.config.js`. Solo:

```css
/* src/index.css */
@import "tailwindcss";
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
plugins: [react(), tailwindcss()]
```

## Conexión con Laravel

El proxy de Vite en `vite.config.ts` redirige `/api/*` → `http://localhost:8000`.
Agrega el token de Sanctum en `ProjectCharterForm.tsx`:

```ts
Authorization: `Bearer ${localStorage.getItem("auth_token")}`
```

## Endpoints esperados

```
POST  /api/submissions
GET   /api/submissions
GET   /api/submissions/{id}
PATCH /api/submissions/{id}/grade
```
