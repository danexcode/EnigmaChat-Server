```
enigma-chat/
├── .env.example              # Plantilla para variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── node_modules/             # Dependencias del proyecto
├── package.json              # Metadatos y dependencias del proyecto
├── prisma/                   # Configuración de Prisma ORM
│   ├── migrations/           # Migraciones de la base de datos
│   └── schema.prisma         # Esquema de la base de datos
├── readme.md                 # Documentación principal del proyecto
├── src/                      # Código fuente de la aplicación
│   ├── app.ts                # Configuración del servidor Express
│   ├── auth/                 # Lógica de autenticación
│   │   ├── index.ts          # Exportador de estrategias
│   │   └── strategies/       # Estrategias de autenticación (JWT, local)
│   ├── config/               # Configuración de la aplicación
│   │   └── index.ts          # Exportador de variables de configuración
│   ├── middlewares/          # Middlewares personalizados de Express
│   │   ├── auth.handler.ts   # Middleware de autorización
│   │   ├── errors.handler.ts # Middleware de manejo de errores
│   │   └── validateData.handler.ts # Middleware de validación de datos
│   ├── routes/               # Definición de rutas de la API
│   │   ├── auth.route.ts     # Rutas de autenticación
│   │   ├── index.ts          # Enrutador principal
│   ├── schemas/              # Esquemas de validación de datos
│   │   ├── auth.schema.ts    # Esquemas de autenticación
│   ├── server.ts             # Punto de entrada del servidor
│   ├── services/             # Lógica de negocio
│   │   ├── auth.service.ts   # Lógica de autenticación
│   ├── types/                # Tipos y DTOs de TypeScript
│   │   ├── dtos.ts           # Data Transfer Objects
│   │   ├── index.ts          # Exportador de tipos
│   │   └── response.ts       # Estructura de respuestas de la API
│   └── utils/                # Funciones de utilidad
│       └── idGenerator.ts    # Generador de IDs únicos
└── tsconfig.json             # Configuración principal de TypeScript
```
