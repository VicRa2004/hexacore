# Autenticación con Refresh Tokens (Hexacore)

## Endpoints

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/register` | `{ name, email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/auth/logout` | `{ refreshToken }` | `{ message }` |

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
accessToken   → en memoria (variable / estado reactivo)
                NUNCA en localStorage ni sessionStorage.

refreshToken  → idealmente en una cookie httpOnly.
                Si no es posible, en memoria junto al access token.
```

¿Por qué en memoria? Porque `localStorage` es accesible desde cualquier
script JS. Un ataque XSS podría leerlo. En memoria desaparece al cerrar la
pestaña, que es el comportamiento deseado.

---

## Flujo completo

### 1. Login / Register

```typescript
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { accessToken, refreshToken, user } = await res.json();

// Guardar en memoria (ejemplo con variables simples)
let currentAccessToken = accessToken;
let currentRefreshToken = refreshToken;
```

---

### 2. Peticiones protegidas

Enviar el access token en el header `Authorization`:

```typescript
const res = await fetch("/api/users", {
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
  if (res.status === 401 && currentRefreshToken) {
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
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    currentAccessToken = data.accessToken;
    currentRefreshToken = data.refreshToken;

    return true;
  } catch {
    return false;
  }
}
```

> **Importante:** cada llamada a `/refresh` devuelve un refresh token
> **nuevo** y revoca el anterior. El front debe guardar siempre el último
> token recibido. No reutilizar tokens viejos.

---

### 5. Logout

```typescript
async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  currentAccessToken = null;
  currentRefreshToken = null;
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
| Access Token | 15 min | `JwtService.ts` → parámetro `expiresIn` |
| Refresh Token | 7 días | `REFRESH_TOKEN_EXPIRY_DAYS` en cada Use Case |

---

## Reglas

- Guardar tokens en **memoria**, nunca en `localStorage`
- Siempre **reemplazar** el refresh token tras cada `/refresh`
- Si `/refresh` devuelve `401` → el refresh token fue revocado → redirigir al login
- En logout, **siempre** llamar a `/api/auth/logout` antes de limpiar el estado local
- Si el front maneja múltiples pestañas, sincronizar tokens vía `BroadcastChannel`
