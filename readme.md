# 🛡️ API REST: Enigma Chat - Documentación de Endpoints

Este documento detalla la interfaz de la API REST para el backend de Enigma Chat, basado en la arquitectura de Herencia de Tabla Única (`Chat`) y la autenticación robusta con 2FA.

## 🔑 Convenciones Generales

* **IDs:** Todos los identificadores (`:userId`, `:chatId`, `:messageId`) son **cadenas alfanuméricas de 8 caracteres** (`CHAR(8)`) generadas por `nanoid`.
* **AuthN (Autenticación):** Requiere un **JWT** válido en el encabezado `Authorization: Bearer <token>`.
* **AuthZ (Autorización):** Requiere AuthN y una verificación de **rol/pertenencia** al recurso.
* **Cifrado:** Todas las operaciones de cifrado/descifrado (`RF-C.1`, `RF-C.2`) se realizan **exclusivamente en el backend**. El frontend solo envía/recibe texto plano.

---

## 1. Endpoints de Autenticación y Cuentas (`/api/auth`)

| Método | Ruta | Descripción | Seguridad | Cuerpo (Body) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | **RF-A.1:** Crea un nuevo usuario. (Incluye Hashing de contraseña). | Ninguna | `username`, `email`, `password` |
| `POST` | `/login` | **RF-A.2:** Inicia sesión. Retorna JWT o estado de "requiere 2FA". | Ninguna | `username`, `password` |
| `POST` | `/verify-2fa` | **RF-A.2:** Completa el login verificando el token TOTP. | Ninguna | `username`, `token_2fa` |
| `POST` | `/setup-2fa` | **RF-A.2 (Setup):** Genera la clave secreta y URL del QR. | AuthN | Ninguna |
| `POST` | `/confirm-2fa` | **RF-A.2 (Confirm):** Activa 2FA permanentemente. | AuthN | `token_2fa` |
| `GET` | `/profile` | Obtiene el perfil del usuario autenticado. | AuthN | Ninguna |
| `POST` | `/reset-password` | **RF-A.3:** Restablece la contraseña con token. | Ninguna | `token`, `new_password` |

---

## 2. Endpoints de Chats y Mensajería (`/api/chats`)

| Método | Ruta | Descripción | Seguridad | Parámetros / Cuerpo |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Lista todos los chats (Individuales y Grupales) del usuario. | AuthN | Query Params: `type` (opcional: `INDIVIDUAL` o `GROUP`) |
| `POST` | `/` | **RF-G.1:** Crea un chat. | AuthN | `chatType`, `groupName` (si es GROUP), `targetUserId` (si es INDIVIDUAL) |
| `GET` | `/:chatId/messages` | **RF-C.2:** Obtiene y **descifra** los mensajes del chat. | AuthZ (Miembro del Chat) | Query Params: `limit`, `offset` |
| `POST` | `/:chatId/messages` | **RF-C.1:** Envía el mensaje (texto plano). El servidor cifra. | AuthZ (Miembro del Chat) | Body: `content` (texto plano) |
| `DELETE` | `/:chatId/messages/:messageId` | Elimina un mensaje. | AuthZ (Miembro y Propietario/Admin) | Ninguno |

---

## 3. Endpoints de Gestión de Grupos (`/api/groups`)

Rutas especializadas para chats de tipo `GROUP`. El `chatId` en estas rutas pertenece a un `GroupChat`.

| Método | Ruta | Descripción | Seguridad | Cuerpo de Solicitud (Body) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/:chatId/members` | Obtiene la lista de miembros y sus roles. | AuthZ (Miembro del Grupo) | Ninguno |
| `POST` | `/:chatId/members` | **RF-G.3:** Añade un usuario al grupo. | AuthZ (Admin del Grupo) | `user_id_to_add`, `role` (opcional) |
| `DELETE` | `/:chatId/members/:userId` | **RF-G.3:** Revoca acceso. **Requiere Rotación de Llave (RF-G.5).** | AuthZ (Admin del Grupo) | Ninguno |
| `POST` | `/:chatId/rotate-key` | **RF-G.5:** Genera una nueva `enigmaMasterKey` para el grupo. | AuthZ (Admin del Grupo) | Ninguno |

---

## 4. Endpoints de Búsqueda y Utilidades (`/api/users`)

| Método | Ruta | Descripción | Seguridad | Parámetros de Consulta (Query) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/search` | Busca usuarios por `username` o `email`. | AuthN | `query` |

---

Este documento es la base para las integraciones tanto del frontend (React) como del backend (Node.js).

Ahora que la documentación de la API está completa, podemos continuar con el desarrollo. ¿Te gustaría que implementemos el controlador para la ruta de **Inicio de Sesión (`POST /api/auth/login`)**?
