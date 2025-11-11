# 🛡️ API REST: Enigma Chat - Documentación de la API

Este documento detalla la interfaz de la API REST para el backend de Enigma Chat, incluyendo autenticación robusta con 2FA y cifrado de extremo a extremo.

## 🔑 Convenciones Generales

* **IDs:** Todos los identificadores son cadenas alfanuméricas generadas por `nanoid`
* **Autenticación:** Requiere cookies de servidor
* **Formato de fechas:** ISO 8601 (ej: `2025-11-06T20:43:00.000Z`)
* **Cifrado:** Todas las operaciones de cifrado/descifrado se realizan en el backend

## 📚 Índice

1. [Autenticación y Usuarios](#1-autenticación-y-usuarios)
2. [Chats](#2-chats)
3. [Grupos](#3-grupos)
4. [WebSocket](#4-websocket)
5. [Manejo de Errores](#5-manejo-de-errores)

---

## 1. Autenticación y Usuarios

### `POST /api/auth/register`
- **Descripción:** Registra un nuevo usuario
- **Autenticación:** No requiere autenticación
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string (formato email)",
    "password": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "is2faEnabled": false
    }
  }
  ```
- **Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`

### `POST /api/auth/login`
- **Descripción:** Inicia sesión de un usuario. Si el usuario tiene el 2FA activado, responde con un token de 2FA en lugar de un token de sesión.
- **Autenticación:** No requiere autenticación
- **Request Body:**
  ```json
  {
    "email": "string (formato email)",
    "password": "string"
  }
  ```
- **Response Body (2FA disabled):**
  ```json
  {
    "token": "string (JWT)",
    "required2fa": false,
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "imageUrl": "string (opcional)",
      "is2faEnabled": false
    }
  }
  ```
- **Response Body (2FA enabled):**
  ```json
  {
    "token": "string (2FA-JWT)",
    "required2fa": true,
    "message": "2FA verification required"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

### `POST /api/auth/setup-2fa`
- **Descripción:** Configura la autenticación de dos factores
- **Autenticación:** Requiere JWT
- **Response Body:**
  ```json
  {
    "secret": "string",
    "qrCode": "string"
  }
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`

### `POST /api/auth/confirm-2fa`
- **Descripción:** Confirma la configuración 2FA con un token
- **Autenticación:** Requiere JWT
- **Request Body:**
  ```json
  {
    "token": "string",
    "secret": "string"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

### `POST /api/auth/verify-2fa`
- **Descripción:** Verifica un código 2FA
- **Autenticación:** Requiere JWT temporal de 2FA
- **Request Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "token": "string (2FA-JWT completo)",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "imageUrl": "string (opcional)",
      "is2faEnabled": true
    }
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

### `POST /api/auth/disable-2fa`
- **Descripción:** Desactiva la autenticación de dos factores
- **Autenticación:** Requiere JWT
- **Status Codes:** `200 OK`, `401 Unauthorized`

### `GET /api/users`
- **Descripción:** Busca usuarios por nombre de usuario o email
- **Autenticación:** Requiere JWT
- **Query Parameters:**
  - `username`: string (opcional)
  - `email`: string (opcional)
- **Response Body:**
  ```json
  [{
    "id": "string",
    "username": "string",
    "email": "string",
    "imageUrl": "string (opcional)"
  }]
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

---

## 2. Chats

### `GET /api/chats`
- **Descripción:** Obtiene la lista de chats del usuario autenticado
- **Autenticación:** Requiere JWT
- **Response Body:**
  ```json
  [{
    "id": "string",
    "type": "string",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "participants": [{
      "id": "string",
      "username": "string",
      "email": "string",
      "imageUrl": "string (opcional)"
    }]
  }]
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`

### `POST /api/chats`
- **Descripción:** Crea un nuevo chat
- **Autenticación:** Requiere JWT
- **Request Body:**
  ```json
  {
    "participantIds": ["string"],
    "type": "DIRECT|GROUP"
  }
  ```
- **Response Body:** Igual que GET /api/chats
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`

### `GET /api/chats/:id/messages`
- **Descripción:** Obtiene los mensajes de un chat
- **Autenticación:** Requiere JWT
- **Response Body:**
  ```json
  [{
    "id": "string",
    "content": "string",
    "senderId": "string",
    "chatId": "string",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "sender": {
      "id": "string",
      "username": "string",
      "imageUrl": "string (opcional)"
    }
  }]
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

### `POST /api/chats/:id/messages`
- **Descripción:** Envía un mensaje a un chat
- **Autenticación:** Requiere JWT
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response Body:** Mensaje creado (mismo formato que GET /api/chats/:id/messages)
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

## 3. Grupos

### `GET /api/groups/:id/members`
- **Descripción:** Obtiene los miembros de un grupo
- **Autenticación:** Requiere JWT
- **Response Body:**
  ```json
  [{
    "id": "string",
    "username": "string",
    "email": "string",
    "imageUrl": "string (opcional)",
    "role": "ADMIN|MEMBER"
  }]
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

### `POST /api/groups/:id/members`
- **Descripción:** Añade un miembro a un grupo
- **Autenticación:** Requiere JWT (solo administradores)
- **Request Body:**
  ```json
  {
    "userId": "string",
    "role": "ADMIN|MEMBER"
  }
  ```
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

### `DELETE /api/groups/:id/members/:userId`
- **Descripción:** Elimina un miembro de un grupo
- **Autenticación:** Requiere JWT (solo administradores)
- **Status Codes:** `204 No Content`, `401 Unauthorized`, `403 Forbidden`

---

## 4. WebSocket

### `WEBSOCKET /ws`
- **Descripción:** Conexión WebSocket para mensajería en tiempo real
- **Eventos:**
  - `message`: Envía/recibe mensajes
  - `typing`: Indica que un usuario está escribiendo
  - `online`: Estado de conexión de usuarios

---

## 5. Manejo de Errores

La API utiliza los siguientes códigos de estado HTTP:

- `200 OK`: La solicitud se completó exitosamente
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Operación exitosa sin contenido que devolver
- `400 Bad Request`: La solicitud es inválida o mal formada
- `401 Unauthorized`: No se proporcionaron credenciales válidas
- `403 Forbidden`: No tiene permisos para acceder al recurso
- `404 Not Found`: El recurso solicitado no existe
- `409 Conflict`: Conflicto con el estado actual del recurso
- `500 Internal Server Error`: Error interno del servidor

Los errores devuelven un objeto JSON con la siguiente estructura:

```json
{
  "statusCode": 400,
  "message": "Mensaje de error descriptivo",
  "error": "Bad Request"
}
```

### Ejemplos de errores comunes

#### Autenticación fallida
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

#### Recurso no encontrado
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "statusCode": 404,
  "message": "Usuario no encontrado",
  "error": "Not Found"
}
```

#### Error de validación
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "statusCode": 400,
  "message": [
    "email debe ser un correo electrónico válido",
    "password debe tener al menos 8 caracteres"
  ],
  "error": "Bad Request"
}
```

---

## 4. Endpoints de Búsqueda y Utilidades (`/api/users`)

| Método | Ruta | Descripción | Seguridad | Parámetros de Consulta (Query) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/search` | Busca usuarios por `username` o `email`. | AuthN | `query` |

---

Este documento es la base para las integraciones tanto del frontend (React) como del backend (Node.js).

Ahora que la documentación de la API está completa, podemos continuar con el desarrollo. ¿Te gustaría que implementemos el controlador para la ruta de **Inicio de Sesión (`POST /api/auth/login`)**?
