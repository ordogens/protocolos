# Especificaciones Técnicas — App de Protocolos

**Producto:** Aplicación móvil (mobile-first) de selección y ejecución de protocolos de ocio/emocional.  
**Stack:** React + TypeScript + Tailwind CSS (Vite).  
**Destinatario:** Ingeniero/a encargado/a de la implementación.  
**Estado:** Documento de alcance y requisitos (PRD + specs técnicas). Nada está construido aún.

---

## 1. Resumen ejecutivo

La app permite al usuario elegir uno de **7 protocolos** (6 de ocio + 1 emocional), ver una lista de **actividades sugeridas** propias de cada protocolo y, al presionar un botón grande **"Iniciar Protocolo"**, enviar una **notificación a un amigo** con el protocolo y actividad seleccionados.

Es una aplicación móvil pensada para usarse con el pulgar (touch-first), con navegación sencilla, componentes pequeños y reutilizables, y código fuertemente tipado con TypeScript.

---

## 2. Alcance del MVP

| Incluido | No incluido (v2+) |
|---|---|
| Catálogo de 7 protocolos con 4–6 actividades cada uno | Autenticación de usuarios (más allá del perfil del amigo) |
| Selector de protocolo y vista de detalle con actividades | Calendario, recordatorios recurrentes o historial |
| Botón grande "Iniciar Protocolo" | Pagos, suscripciones o perfiles públicos |
| Envío de notificación al amigo (canal por definir) | Chat dentro de la app |
| Almacenamiento local (último protocolo usado, favoritos) | Modo offline completo |
| Diseño responsive mobile (375 px base) | App nativa publicada en stores (PWA o wrapper posterior) |

---

## 3. Stack tecnológico recomendado

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | React 18 + TypeScript (strict) | Tipado fuerte, ecosistema mobile |
| Build tool | Vite | Arranque rápido, build optimizado |
| Estilos | Tailwind CSS | Utilidades mobile-first, diseño consistente |
| Ruteo | React Router DOM (6+) | Navegación simple entre páginas |
| Estado global | Zustand (o Context API si se prefiere no agregar dependencias) | Tiendas pequeñas y tipadas por dominio |
| Estático / datos iniciales | Archivo JSON en `src/data/` | Catálogo de protocolos sin backend en MVP |
| Almacenamiento local | `localStorage` | Último protocolo, favoritos, preferencias |
| Notificaciones | Canal por definir (ver §11) | WhatsApp, Telegram, SMS, email o push |
| Lint / Formato | ESLint + Prettier | Calidad y consistencia de código |
| Pruebas (opcional MVP) | Vitest + React Testing Library | Pruebas unitarias de utilidades y componentes clave |

---

## 4. Estructura de carpetas (profesional, sin componentes monolíticos)

```
protocolo-app/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── vite.svg
└── src/
    ├── assets/
    │   ├── icons/          # SVG optimizados por protocolo y UI
    │   └── images/
    ├── components/
    │   ├── common/                     # Componentes atómicos y reutilizables
    │   │   ├── Button.tsx
    │   │   ├── PrimaryButton.tsx       # Botón grande "Iniciar Protocolo"
    │   │   ├── IconButton.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Input.tsx
    │   │   ├── Text.tsx
    │   │   └── Index.ts
    │   ├── layout/                     # Estructura de pantalla
    │   │   ├── AppShell.tsx
    │   │   ├── Header.tsx
    │   │   ├── SafeArea.tsx
    │   │   └── MobileContainer.tsx
    │   ├── protocols/                  # Dominio de protocolos
    │   │   ├── ProtocolCard.tsx
    │   │   ├── ProtocolList.tsx
    │   │   ├── ActivityChip.tsx
    │   │   ├── ProtocolDetail.tsx
    │   │   └── ProtocolSelector.tsx
    │   └── notification/               # Dominio de notificaciones
    │       ├── NotificationButton.tsx
    │       ├── NotificationStatus.tsx
    │       └── FriendSelector.tsx
    ├── config/
    │   └── theme.ts                    # Colores, tipografía y breakpoints
    ├── data/
    │   └── protocols.ts                # Catálogo estático de protocolos y actividades
    ├── hooks/
    │   ├── useProtocols.ts
    │   ├── useNotification.ts
    │   ├── useLocalStorage.ts
    │   └── useMobile.ts
    ├── pages/
    │   ├── Home.tsx
    │   ├── ProtocolSelector.tsx
    │   ├── ProtocolDetail.tsx
    │   ├── StartProtocol.tsx
    │   ├── Notifications.tsx
    │   └── Settings.tsx
    ├── routes/
    │   ├── AppRouter.tsx
    │   └── routeGuard.ts
    ├── services/
    │   ├── api.ts
    │   ├── notificationService.ts
    │   └── storageService.ts
    ├── stores/                         # Zustand stores (alternativa a Context)
    │   ├── protocolStore.ts
    │   ├── notificationStore.ts
    │   └── userStore.ts
    ├── types/
    │   ├── index.ts
    │   ├── protocol.ts
    │   ├── notification.ts
    │   └── user.ts
    ├── utils/
    │   ├── cn.ts                       # tailwind-merge helper
    │   ├── format.ts
    │   └── validators.ts
    └── main.tsx
```

### Reglas de separación
- **Un componente por archivo.** Ningún componente supere las 200 líneas; si lo hace, dividir en subcomponentes dentro de su carpeta de dominio.
- **Nada de lógica de negocio dentro de componentes UI genéricos** (`common/`). La lógica vive en `hooks/`, `services/` o `stores/`.
- **Tipos en `types/`, no inline** en componentes.
- **Íconos como componentes SVG** o assets optimizados en `assets/icons/`.

---

## 5. Dominio de datos

### 5.1 Tipos principales (`src/types/`)

```ts
// protocol.ts
export type ProtocolId = 'caminar' | 'rio' | 'motos' | 'comer' | 'acampar' | 'fiesta' | 'emocional';

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon?: string;
  duration?: string; // ej. "1–2 horas"
}

export interface Protocol {
  id: ProtocolId;
  name: string;
  category: string;
  icon: string;
  color: string; // clase Tailwind o hex
  description: string;
  activities: Activity[]; // entre 4 y 6
}

// notification.ts
export type NotificationChannel = 'whatsapp' | 'telegram' | 'sms' | 'email' | 'push';

export interface Notification {
  id: string;
  protocolId: ProtocolId;
  activityId?: string;
  recipientName: string;
  recipientContact: string; // teléfono, usuario o email
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  payload: Record<string, unknown>;
}

// user.ts
export interface Friend {
  id: string;
  name: string;
  contact: string;
  channel: NotificationChannel;
}
```

### 5.2 Catálogo de protocolos y actividades (`src/data/protocols.ts`)

Cada protocolo debe tener **entre 4 y 6 actividades distintas**, acordes a su categoría.

| # | Protocolo | Categoría | Actividades sugeridas (4–6) |
|---|---|---|---|
| 1 | Salir a caminar | Aire libre / suave | Ruta urbana, sendero de naturaleza, caminata con mascota, fotografía callejera, caminata silenciosa (mindfulness), geocaching |
| 2 | Ir al río | Agua / naturaleza | Natación, piragüismo o kayak, pesca recreativa, picnic en la orilla, observación de aves, fogata controlada |
| 3 | Salir en las motos | Ruedas / aventura | Ruta escénica, encuentro motero, ruta gastronómica en moto, off-road ligero, visita a café motero, ruta al atardecer |
| 4 | Ir a comer | Gastronomía | Restaurante nuevo, food trucks, mercado local, cocina en casa juntos, postres y café, brunch dominical |
| 5 | Ir a acampar | Aire libre / inmersión | Montaje de tienda, senderismo nocturno, observación de estrellas, cocina al fogón, juegos de mesa en carpa, caminata matinal |
| 6 | Salir de fiesta | Social / noche | Bares y copas, club nocturno, concierto en vivo, karaoke, fiesta temática en casa, after |
| 7 | Protocolo emocional | Bienestar / contención | Respiración guiada, caminata terapéutica, journaling (escritura), llamada a persona de confianza, dibujo o arte, grounding / baño de bosque |

> Cada actividad debe tener `id`, `title`, `description`, `icon` (opcional) y `duration` (opcional).

---

## 6. Flujo de navegación y rutas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | `Home` | Pantalla de bienvenida con acceso rápido a protocolos recientes y botón "Ver todos los protocolos". |
| `/protocolos` | `ProtocolSelector` | Lista de los 7 protocolos con tarjetas (`ProtocolCard`). |
| `/protocolos/:id` | `ProtocolDetail` | Detalle del protocolo: descripción, lista de actividades (`ActivityChip`) y botón grande "Iniciar Protocolo". |
| `/iniciar` | `StartProtocol` | Confirmación de selección, elección de actividad (opcional) y disparo de notificación al amigo. |
| `/notificaciones` | `Notifications` | Historial/estado de notificaciones enviadas al amigo. |
| `/ajustes` | `Settings` | Configuración del amigo (nombre, contacto, canal) y preferencias de la app. |

Navegación mobile-first: barra inferior o header sencillo, touch targets ≥ 44 px, sin menús desplegables complejos.

---

## 7. Componentes reutilizables (`src/components/`)

| Componente | Ubicación | Responsabilidad |
|---|---|---|
| `PrimaryButton` | `common/` | Botón grande, ancho completo en móvil, usado para "Iniciar Protocolo". |
| `Button` | `common/` | Botón secundario/terciario genérico. |
| `IconButton` | `common/` | Botón solo con ícono (cerrar, favorito, etc.). |
| `Card` | `common/` | Contenedor base con borde suave y sombra. |
| `Badge` | `common/` | Etiqueta de estado o categoría. |
| `Modal` | `common/` | Overlay accesible para confirmaciones. |
| `Spinner` | `common/` | Estado de carga. |
| `AppShell` | `layout/` | Estructura base de la app (header + contenido). |
| `SafeArea` | `layout/` | Respeta notch y barras del sistema en móvil. |
| `MobileContainer` | `layout/` | Contenedor con padding móvil y ancho máximo. |
| `ProtocolCard` | `protocols/` | Tarjeta de protocolo con ícono, nombre, categoría y color. |
| `ProtocolList` | `protocols/` | Lista paginada o en grid de protocolos. |
| `ActivityChip` | `protocols/` | Chip individual de actividad sugerida. |
| `ProtocolDetail` | `protocols/` | Vista de detalle con actividades y botón de inicio. |
| `NotificationButton` | `notification/` | Botón de envío con estado (enviando/enviado/error). |
| `NotificationStatus` | `notification/` | Badge o texto con estado de la notificación. |
| `FriendSelector` | `notification/` | Selector o formulario para definir el amigo destinatario. |

Todos los componentes de `common/` deben ser puros: reciben props y no llaman a APIs directamente.

---

## 8. Gestión de estado y servicios

### 8.1 Stores sugeridas (`src/stores/`)
- `protocolStore`: protocolo activo, actividad seleccionada, lista de protocolos.
- `notificationStore`: historial de notificaciones, estado de envío, amigo configurado.
- `userStore`: datos del usuario logueado (si aplica) y preferencias.

### 8.2 Servicios (`src/services/`)
- `api.ts`: cliente base (axios o fetch) con interceptores y variables de entorno.
- `notificationService.ts`: función `sendNotification(data)` que delega al canal configurado (ver §11).
- `storageService.ts`: envoltura tipada sobre `localStorage`.

### 8.3 Hooks (`src/hooks/`)
- `useProtocols()`: obtiene el catálogo y protocolo activo.
- `useNotification()`: envía notificación y maneja estados.
- `useLocalStorage<T>()`: persistencia tipada.
- `useMobile()`: detecta si es dispositivo móvil y dimensiones de pantalla.

---

## 9. Requisitos de notificación al amigo

Cuando el usuario presiona **"Iniciar Protocolo"**, la app debe:

1. Tomar el protocolo y actividad seleccionados.
2. Tomar los datos del amigo configurados en ajustes (nombre, contacto, canal).
3. Llamar a `notificationService.sendNotification()` con un payload como:

```ts
{
  protocol: 'Protocolo emocional',
  activity: 'Respiración guiada',
  user: 'Ordogen',
  message: 'Ordogen inició el protocolo emocional: Respiración guiada.',
  sentAt: ISO8601
}
```

### Canales sugeridos (definir uno en `.env`)
- **Telegram Bot:** enviar mensaje al chat del amigo (el usuario ya usa Telegram; se puede reutilizar el bot actual).
- **WhatsApp Business API / Click-to-chat:** abrir enlace o enviar plantilla.
- **SMS:** vía Twilio o similar.
- **Email:** vía Resend, SendGrid o SMTP.
- **Push (FCM):** requiere backend y registro de dispositivo (post-MVP).

**Variable de entorno sugerida:** `VITE_NOTIFICATION_CHANNEL=telegram` y `VITE_NOTIFICATION_ENDPOINT=...`

La notificación debe registrarse localmente con estado `pending → sent/failed` para poder mostrar historial en `/notificaciones`.

---

## 10. Buenas prácticas y convenciones de código

1. **TypeScript estricto:** `strict: true` en `tsconfig.json`. No usar `any` sin justificación.
2. **Componentes funcionales + hooks.** Nada de componentes de clase.
3. **Tailwind para todo el styling.** No crear archivos `.css` sueltos salvo excepciones justificadas.
4. **Mobile-first:** diseñar para 375 px primero, luego escalar. Touch targets mínimos de 44 px.
5. **Accesibilidad:** atributos `aria-*`, foco visible, contraste ≥ 4.5:1, etiquetas en botones ícono.
6. **Internacionalización lista:** todo el texto visible en español, pero extraído a constantes o `i18n` para facilitar traducción futura.
7. **Variables de entorno:** secretos y URLs de API en `.env`, nunca hardcodeados.
8. **Lint y formato:** ESLint + Prettier ejecutarse antes de cada commit (husky/lint-staged recomendado).
9. **Imágenes e íconos:** SVG optimizados en `assets/icons/`; rasterizado comprimido en `assets/images/`.
10. **Tests:** pruebas unitarias de `utils`, `services` y componentes complejos con Vitest + RTL.

---

## 11. Criterios de aceptación (MVP)

- [ ] La app compila sin errores de TypeScript (`npm run build` exitoso).
- [ ] Se visualizan los 7 protocolos en pantalla de selección.
- [ ] Cada protocolo muestra entre 4 y 6 actividades propias de su categoría.
- [ ] Al seleccionar un protocolo, se abre su detalle con las actividades.
- [ ] Existe un botón grande "Iniciar Protocolo" en la vista de detalle.
- [ ] Al presionarlo, se envía una notificación al amigo con protocolo y actividad.
- [ ] El estado de la notificación (enviado/error) se muestra en pantalla.
- [ ] El diseño es usable en móvil (375 px) sin scroll horizontal ni elementos rotos.
- [ ] El código pasa ESLint y Prettier sin errores.

---

## 12. Próximos pasos para el ingeniero

1. Confirmar stack definitivo (Vite + React Router vs. Expo/Capacitor si se quiere app nativa real).
2. Definir el canal de notificación al amigo y obtener credenciales (token de bot de Telegram, API key de WhatsApp/Twilio, etc.).
3. Crear el repositorio e inicializar el proyecto con la estructura de §4.
4. Implementar el catálogo estático de protocolos y actividades (§5.2).
5. Construir los componentes de `common/` y `layout/` primero.
6. Implementar páginas y navegación (§6).
7. Conectar el servicio de notificaciones y el almacenamiento del amigo (§8 y §9).
8. Ejecutar pruebas en dispositivo móvil real o emulador.

---

## 13. Preguntas abiertas para definir antes de codificar

1. ¿Qué canal de notificación prefiere usar para avisar al amigo? (Telegram, WhatsApp, SMS, email)
2. ¿La app será una PWA móvil o se envolverá después con Capacitor/Cordova?
3. ¿El amigo tiene un contacto fijo (teléfono/usuario de Telegram) o se selecciona dinámicamente?
4. ¿Requiere persistencia de notificaciones en un backend, o `localStorage` es suficiente para el MVP?

---

*Documento listo para revisión del ingeniero. Nada se construye hasta que se confirme el alcance y el canal de notificación.*