# CRUD Fabricio - Backend API 🚀

Este repositorio contiene la API REST para el proyecto **CRUD Fabricio**, desarrollada bajo el ecosistema moderno de **MERN** (MongoDB, Express, React, Node.js). Proporciona una base escalable, segura y optimizada para la persistencia de datos y gestión de la lógica de negocio.

---

## 🛠️ Tecnologías y Dependencias

El servidor está construido utilizando módulos modernos de JavaScript (`"type": "module"`) y las siguientes dependencias clave:

*   **[Express 5](https://expressjs.com)** - Framework web rápido e hiper-minimalista para Node.js.
*   **[Mongoose](https://mongoosejs.com)** - Modelado de datos y esquemas NoSQL para **MongoDB**.
*   **[Jsonwebtoken (JWT)](https://jsonwebtoken.io)** - Generación de tokens seguros para autenticación de usuarios.
*   **[Bcryptjs](https://npmjs.com)** - Encriptación y hasheo seguro de contraseñas.
*   **[Joi](https://joi.dev)** - Validación rigurosa de estructuras y payloads de datos entrantes.
*   **[Cors](https://npmjs.com)** - Configuración de accesos cruzados para conectar el Frontend de forma segura.
*   **[Dotenv](https://npmjs.com)** - Configuración limpia de variables de entorno del servidor.

### 🛡️ Módulos de Seguridad y Rendimiento Avanzado
*   **[Express Rate Limit](https://npmjs.com)** - Middleware básico para limitar solicitudes HTTP repetitivas.
*   **[Rate Limiter Flexible](https://github.com)** - Protección avanzada y flexible contra ataques de fuerza bruta (DDoS/Spamming) a nivel de servidor.

### Dependencias de Desarrollo
*   **[Nodemon](https://nodemon.io)** - Monitoreo y reinicio automático del servidor local en cada guardado de código.

---

## 📂 Estructura del Proyecto

```text
crud-fabricio-backend/
├── src/                  # Código fuente de la aplicación
│   ├── config/           # Configuración de base de datos (MongoDB connection)
│   ├── controllers/      # Controladores (Lógica de negocio del CRUD)
│   ├── dto/              # Validaciones de modelos
│   ├── models/           # Modelos de datos creados con Mongoose
│   ├── helpers/          # Respuestas a requests
│   ├── routes/           # Definición de rutas y endpoints de la API
│   ├── middlewares/      # Filtros de seguridad, JWT y validaciones Joi
│   ├── services/         # Manejo de datos
│   └── app.js            # Punto de entrada principal (Servidor Express)
├── .gitignore            # Archivos ignorados por Git (.env, node_modules)
├── package.json          # Archivo de configuración del proyecto y dependencias
└── README.md             # Documentación técnica
```

---

## 🛣️ Endpoints de la API (Rutas)

A continuación se detallan las rutas principales integradas en el servidor (puedes adaptarlas según la entidad del CRUD que estés gestionando):

### 🔐 Autenticación y Usuarios (`/api/auth` o `/api/users`)
*   `POST /auth/login` - Autentica a un usuario y retorna un Token JWT válido.(Controla login por Fuerza Bruta y Rate Limit)
*   `GET /users` - Obtiene la información del perfil del usuario  (Requiere Validación de Middleware JWT).
*   `POST /users` - Registra un nuevo usuario en el sistema. (Contraseña hasheada con Bcryptjs + Validación Joi. Requiere validación de Middleware JWT y Roles).
*   `PUT /users` - Modifica un usuario en el sistema. (Contraseña hasheada con Bcryptjs + Validación Joi.  Requiere validación de Middleware JWT y Roles).
*   `DELETE /users` - Elimina un usuario del sistema. (Contraseña hasheada con Bcryptjs + Validación Joi.  Requiere validación de Middleware JWT y Roles).

---

## 🔧 Configuración e Instalación Local

Sigue estos pasos para clonar y levantar el entorno de desarrollo localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Fabaste/crud-fabricio-backend
cd <Tu carpeta de proyecto>
```

### 2. Instalar dependencias del proyecto
Usa npm para descargar los paquetes listados en el manifest de Node:
```bash
npm install
```
```text
├── bcryptjs@3.0.3
├── cors@2.8.6
├── dotenv@17.4.2
├── express-rate-limit@8.6.0
├── express@5.2.1
├── joi@18.2.3
├── jsonwebtoken@9.0.3
├── mongoose@9.8.0
├── nodemon@3.1.14
└── rate-limiter-flexible@11.2.0
```

### 3. Configurar variables de entorno (`.env`)
Crea un archivo llamado `.env` en la raíz del backend (al mismo nivel del `package.json`). **No subas este archivo a GitHub**. Configura los siguientes campos:

```env
PORT=5000
MONGO_URI=tu_string_de_conexion_a_mongodb_atlas_o_local
JWT_SECRET=tu_clave_secreta_super_segura_para_firmar_tokensappName=FullstackInicio

JWT_EXPIRES_IN = Tiempo de expiracion de JWT
FRONTEND_URLS= URL del Front para permitir Cors

# RATE LIMIT API
RATE_LIMIT_WINDOW_MINUTES= Tiempo para el calculo de maximo requests
RATE_LIMIT_MAX_REQUESTS= Maximos requests permitidos dentro del tiempo configurado

# LOGIN
LOGIN_WINDOW_MINUTES= Tiempo para login
LOGIN_MAX_ATTEMPTS= Cantidad maxima de login fallidos
LOGIN_BLOCK_MINUTES= Tiempo de bloqueo al superar la cantidad maxima de login fallidos
```

### 4. Ejecutar el servidor en desarrollo
Para iniciar la API usando **Nodemon** para refrescar cambios automáticamente en tiempo real:
```bash
npm run dev
```

El servidor web Express se levantará y se conectará de manera automática a tu instancia de base de datos MongoDB.

---

## 👤 Autor
*   **Fabricio** - *Full Stack Developer* - [@Fabaste](https://github.com)
