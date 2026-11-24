---
name: autenticacion
description: "Flujo de autenticación del backend: access token JWT + refresh token en cookie httpOnly, endpoints /api/auth/*, rotación, expiraciones, recuperación de contraseña, verificación de email, bloqueo por intentos y cómo debe consumirlo el frontend. Úsala al tocar el módulo auth, sesiones, cookies, correos de cuenta o la renovación de tokens en el cliente."
---

# Autenticación con Refresh Tokens (Hexacore)

## Endpoints

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ accessToken, usuario }` + cookie, o `{ requiere2fa: true, token2fa }` sin cookie si el usuario tiene 2FA |
| POST | `/api/auth/login/2fa` | `{ token2fa, codigo }` | `{ accessToken, usuario }` + cookie (código TOTP o de recuperación) |
| POST | `/api/auth/registro` | `{ nombre, email, password }` | `{ accessToken, usuario }` + cookie |
| POST | `/api/auth/refresh` | — (lee la cookie) | `{ accessToken }` + cookie nueva |
| POST | `/api/auth/logout` | — (lee la cookie) | `{ mensaje }` y borra la cookie |
| POST | `/api/auth/recuperar-password` | `{ email }` | `{ mensaje }` (igual exista o no el email) |
| POST | `/api/auth/restablecer-password` | `{ token, password }` | `{ mensaje }`; cierra todas las sesiones y desbloquea |
| POST | `/api/auth/verificar-email` | `{ token }` | `{ mensaje }` |
| POST | `/api/auth/verificar-email/reenviar` | — (Bearer) | `{ mensaje }` |
| PUT | `/api/auth/password` | `{ passwordActual, passwordNueva }` (Bearer) | `{ accessToken }` + cookie nueva; revoca el resto de sesiones |
| POST | `/api/auth/logout-todas` | — (Bearer) | `{ mensaje }`; revoca todos los refresh tokens y borra la cookie |
| GET | `/api/auth/sesiones` | — (Bearer + cookie) | `Sesion[]`: una por dispositivo (user agent, último uso), `actual` = la de la cookie |
| DELETE | `/api/auth/sesiones/{id}` | — (Bearer) | `{ mensaje }`; borra el token de esa sesión (no lo revoca: su dispositivo lo reenviará y un revocado reutilizado cerraría todas). `404` si no es tuya o ya no existe |

El refresh token **nunca** viaja en el body: el servidor lo fija en la cookie
`refresh_token` (`HttpOnly`, `SameSite=Strict`, `Path=/api/auth`, `Secure` en
producción). El navegador la envía sola a las rutas de auth y JavaScript no
puede leerla.

Límites por IP: login 5 intentos / 15 min, registro 4 / hora, correos (recuperar
y reenviar verificación) 5 / hora, uso de tokens 10 / 15 min (responden `429`).

Bloqueo por cuenta (además del límite por IP, contra ataques distribuidos): 5
fallos seguidos bloquean la cuenta 15 min (`429`, sin comprobar la contraseña).
Un login correcto o restablecer la contraseña reinician el contador.

## Verificación en dos pasos (TOTP)

- Opcional por usuario. Endpoints (Bearer): `GET /2fa` (`{ activo, codigosRestantes }`),
  `POST /2fa/alta` (`{ secreto, otpauthUri }`, el alta queda pendiente),
  `POST /2fa/activar` `{ codigo }` (activa y devuelve 10 códigos de recuperación),
  `POST /2fa/desactivar` `{ password, codigo }` y `POST /2fa/codigos-recuperacion`
  `{ codigo }` (los regenera). Los códigos de recuperación solo se ven en esas respuestas.
- TOTP RFC 6238 (SHA-1, 6 dígitos, 30 s, ±1 paso) con `node:crypto`
  (`application/services/totp.ts`). Un código ya aceptado no se reutiliza
  (`usr_totp_ultimo_paso`).
- Secreto cifrado con AES-256-GCM (`AesGcmCifrador`) con `TOTP_ENCRYPTION_KEY`, o
  derivado de `JWT_SECRET` si no está (rotar `JWT_SECRET` invalidaría entonces todos
  los 2FA). Códigos de recuperación en `codigo_recuperacion` como hash SHA-256.
- `token2fa`: JWT de 5 min firmado con una clave derivada de `JWT_SECRET`, así que no
  vale como access token. `/login/2fa` tiene límite propio (10 / 15 min por IP) y
  comparte el bloqueo por cuenta: con 2FA, la contraseña correcta **no** reinicia el
  contador (lo hace el código), para que repetirla no dé intentos ilimitados.
- Con sesión, un código incorrecto responde `400` (un `401` haría renovar el token en
  la web). Activar/desactivar publican `auth.2fa_activado` / `auth.2fa_desactivado`
  (auditoría).

## Tokens de un solo uso y correos

- Tabla `token_cuenta` (hash SHA-256, nunca el token en claro), tipos
  `recuperar_password` (1 h) y `verificar_email` (24 h). Pedir uno nuevo
  invalida los anteriores sin usar del mismo tipo.
- `EmisorCorreosCuenta` genera el token y envía el enlace `${APP_URL}/<ruta>?token=…`
  por el puerto `Mailer` (`TOKENS.Mailer`): `ResendMailer` si hay `RESEND_API_KEY`,
  si no `ConsoleMailer` (en prod no imprime el cuerpo, para no filtrar enlaces).
- El registro envía la verificación; un fallo del correo no deshace el registro.
  Verificar el email es informativo (`usuario.emailVerificado`): no bloquea el login.
- En los e2e, `spyOn(container.get(TOKENS.Mailer), "enviar")` captura los enlaces.

---

## Concepto: ¿por qué dos tokens?

```text
accessToken   → JWT, vida corta (15 min), NO se guarda en BD
                Se envía en cada petición protegida.
                Si lo roban, expira solo en minutos.

refreshToken  → String opaco, vida larga (7 días), SÍ se guarda en BD (como hash)
                Solo sirve para obtener un nuevo par de tokens.
                Si lo roban, se puede revocar desde el servidor.
```

El access token es **stateless** (el servidor no lo almacena). No se puede
"cancelar" antes de que expire, pero como solo dura 15 minutos la ventana de
riesgo es mínima.

El refresh token es **stateful** (su hash vive en la tabla `refresh_token`).
Se puede revocar en cualquier momento haciendo `revoked = true` en la BD.

---

## Almacenamiento en el frontend

```text
accessToken   → idealmente en memoria (variable / estado reactivo).
                El frontend de la plantilla lo persiste en localStorage para
                sobrevivir a recargas; dura 15 min, así que el riesgo es acotado.

refreshToken  → cookie httpOnly gestionada por el servidor.
                El front no lo ve ni lo guarda.
```

¿Por qué no en `localStorage`? Porque es accesible desde cualquier script JS:
un ataque XSS podría leerlo. La cookie httpOnly no es legible desde JS.

> La cookie usa `Path=/api/auth`, así que el front debe llamar a la API en el
> **mismo origen** (en desarrollo, el proxy `/api` de Vite).

---

## Flujo completo

### 1. Login / Register

```typescript
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

// El refresh token llega en la cookie httpOnly; aquí sólo el access token
const { accessToken, usuario } = await res.json();

let currentAccessToken = accessToken;
```

---

### 2. Peticiones protegidas

Enviar el access token en el header `Authorization`:

```typescript
const res = await fetch("/api/usuarios", {
  headers: {
    Authorization: `Bearer ${currentAccessToken}`,
  },
});
```

---

### 3. Renovación automática al recibir 401

Cuando el access token expira, el servidor devuelve `401`. El front debe
interceptar esa respuesta, llamar a `/refresh` y reintentar la petición
original de forma transparente.

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Inyectar el token actual
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${currentAccessToken}`,
  };

  let res = await fetch(url, options);

  // Si el access token expiró, intentar renovar
  if (res.status === 401 && currentAccessToken) {
    const refreshed = await refreshTokens();

    if (refreshed) {
      // Reintentar la petición original con el nuevo token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${currentAccessToken}`,
      };
      res = await fetch(url, options);
    } else {
      // El refresh token también es inválido → enviar al login
      redirectToLogin();
    }
  }

  return res;
}
```

---

### 4. Función de refresh

```typescript
async function refreshTokens(): Promise<boolean> {
  try {
    // La cookie viaja sola (mismo origen); no hace falta body
    const res = await fetch("/api/auth/refresh", { method: "POST" });

    if (!res.ok) return false;

    const data = await res.json();
    currentAccessToken = data.accessToken;

    return true;
  } catch {
    return false;
  }
}
```

> **Importante:** cada llamada a `/refresh` revoca el refresh token anterior
> y fija uno **nuevo** en la cookie. Dos llamadas simultáneas con la misma
> cookie: sólo una gana, la otra recibe `401`. Serializa las renovaciones.

---

### 5. Logout

```typescript
async function logout() {
  // Revoca el refresh token de la cookie y la borra
  await fetch("/api/auth/logout", { method: "POST" });

  currentAccessToken = null;
  redirectToLogin();
}
```

---

## Ejemplo con Axios (interceptor)

Si el front usa Axios, el flujo de renovación se implementa como interceptor:

```typescript
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Inyectar access token en cada petición
api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Renovar tokens al recibir 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si ya se está renovando, encolar la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        originalRequest.headers.Authorization =
          `Bearer ${currentAccessToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const success = await refreshTokens();

      if (!success) {
        failedQueue.forEach(({ reject }) => reject(error));
        redirectToLogin();
        return Promise.reject(error);
      }

      // Reintentar peticiones encoladas
      failedQueue.forEach(({ resolve }) => resolve());
      failedQueue = [];

      originalRequest.headers.Authorization =
        `Bearer ${currentAccessToken}`;
      return api(originalRequest);
    } finally {
      isRefreshing = false;
    }
  },
);
```

> La variable `isRefreshing` y la cola `failedQueue` evitan que múltiples
> peticiones simultáneas disparen múltiples llamadas a `/refresh` al mismo
> tiempo (race condition).

---

## Tiempos de expiración

| Token | Duración | Configurable en |
|-------|----------|-----------------|
| Access Token | 15 min | `JwtService.ts` → opción `expiresIn` |
| Refresh Token | 7 días | `DIAS_EXPIRACION_REFRESH_TOKEN` en cada Use Case y `maxAge` en `refreshTokenCookie.ts` |

---

## Reglas

- El refresh token vive sólo en la cookie httpOnly; nunca en `localStorage`
- Si `/refresh` devuelve `401` → el refresh token fue revocado → redirigir al login
- En logout, **siempre** llamar a `/api/auth/logout` antes de limpiar el estado local
- Si el front maneja múltiples pestañas, sincronizar tokens vía `BroadcastChannel`
