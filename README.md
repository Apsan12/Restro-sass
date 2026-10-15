# Restro SaaS

Restro SaaS is a multi-tenant restaurant management backend. It provides one
REST API for multiple restaurants while keeping each restaurant's data
isolated.

The backend currently supports:

- Authentication with JWT and HTTP-only cookies
- Role-based authorization
- Restaurant onboarding
- Staff and kitchen staff management
- Categories and menu items
- Restaurant tables and private rooms
- Food orders and order-status updates
- Cloudinary image uploads
- MongoDB persistence with Mongoose

Bookings, reports, analytics, real-time updates, and frontend applications are
planned but are not currently exposed as API modules.

---

## Contents

1. [Technology stack](#technology-stack)
2. [Repository structure](#repository-structure)
3. [How the application works](#how-the-application-works)
4. [User roles](#user-roles)
5. [Prerequisites](#prerequisites)
6. [Local setup](#local-setup)
7. [Environment variables](#environment-variables)
8. [Running the backend](#running-the-backend)
9. [Health checks](#health-checks)
10. [Authentication](#authentication)
11. [Multi-tenant data isolation](#multi-tenant-data-isolation)
12. [API reference](#api-reference)
13. [File uploads](#file-uploads)
14. [Pagination](#pagination)
15. [Database and transactions](#database-and-transactions)
16. [Development rules](#development-rules)
17. [Current status and roadmap](#current-status-and-roadmap)
18. [License](#license)

---

## Technology stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| HTTP server | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Token, bcryptjs |
| Validation | Zod |
| File uploads | Multer |
| Image storage | Cloudinary |
| Security | Helmet, CORS, HTTP-only cookies |
| Logging | Morgan |

The backend is an ES module project and is compiled to `backend/dist`.

---

## Repository structure

```text
restaurant-sass/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Cloudinary configuration
│   │   ├── controller/      # HTTP request/response handlers
│   │   ├── middleware/      # Authentication, roles, tenant checks, uploads
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express route definitions
│   │   ├── scripts/         # Startup scripts, including admin seeding
│   │   ├── services/        # Business logic and database operations
│   │   ├── utils/           # JWT and pagination helpers
│   │   └── validator/       # Zod request schemas
│   ├── app.ts               # Express app and route mounting
│   ├── server.ts            # Environment loading, DB connection, startup
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

Request processing follows this order:

```text
Request
  → Route
  → Middleware
  → Controller
  → Validator
  → Service
  → Model
  → MongoDB
```

Controllers should coordinate requests and responses. Business rules belong in
services, and database access belongs behind the service layer.

---

## How the application works

The platform has one global administrator and one or more restaurants:

```text
SUPER_ADMIN
    │
    ├── Restaurant A
    │     ├── BUSINESS_ADMIN
    │     ├── STAFF
    │     └── KITCHEN_STAFF
    │
    └── Restaurant B
          ├── BUSINESS_ADMIN
          ├── STAFF
          └── KITCHEN_STAFF
```

Restaurant-owned resources include:

- Staff accounts
- Categories
- Menu items
- Tables
- Rooms
- Orders

Each restaurant-owned document includes a `restaurantId`. Users who belong to a
restaurant can only access resources from that restaurant.

---

## User roles

### `SUPER_ADMIN`

Platform-level administrator. This role is not tied to one restaurant and can
create restaurants.

### `BUSINESS_ADMIN`

Restaurant administrator. This role manages staff, categories, menu items,
tables, rooms, and restaurant operations.

### `STAFF`

Restaurant operations staff. This role can view operational data and create or
cancel orders where permitted.

### `KITCHEN_STAFF`

Kitchen staff. This role can view menu items, tables, rooms, and orders, and can
update order statuses.

---

## Prerequisites

Install the following before starting development:

- Node.js with npm
- MongoDB
- Git
- A Cloudinary account if image upload features are used

The backend uses MongoDB transactions in order operations. A local MongoDB
replica set is recommended when testing transaction-based workflows.

---

## Local setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-sass
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create the environment file

Create this file:

```text
backend/src/.env
```

The application loads environment variables from `./src/.env` when commands
are run from the `backend` directory.

Use the template below and replace each placeholder with a real value:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_saas

JWT_ACCESS_SECRET=replace_with_a_long_random_secret

SUPER_ADMIN_NAME=System Administrator
SUPER_ADMIN_EMAIL=admin@restaurant.com
SUPER_ADMIN_PASSWORD=replace_with_a_strong_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never commit `.env` files or real credentials.

### 4. Start MongoDB

Start MongoDB locally or provide a reachable MongoDB connection string in
`MONGODB_URI`.

For transaction testing with a local replica set, an example URI is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_saas?replicaSet=rs0
```

### 5. Start the development server

```bash
npm run dev
```

The default server URL is:

```text
http://localhost:5000
```

On startup, the server connects to MongoDB and seeds the configured
`SUPER_ADMIN` account when required.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port; defaults to `5000` |
| `NODE_ENV` | No | Enables production cookie settings when set to `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign and verify access tokens |
| `SUPER_ADMIN_NAME` | No | Initial platform administrator name |
| `SUPER_ADMIN_EMAIL` | Yes | Initial platform administrator email |
| `SUPER_ADMIN_PASSWORD` | Yes | Initial platform administrator password |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

Cloudinary variables are required by the current Cloudinary configuration,
including when image endpoints are not being tested.

---

## Running the backend

Run commands from `backend/`:

```bash
# Watch mode for development
npm run dev

# Type-check and compile to backend/dist
npm run build

# Run the compiled server
npm start
```

Before opening a pull request, run:

```bash
npm run build
```

---

## Health checks

The API exposes two public health endpoints:

```http
GET /
GET /api/v1/health
```

Example:

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "Restaurant SaaS API is running"
}
```

---

## Authentication

### Login

```http
POST /api/v1/auth/login
```

The login endpoint sets an HTTP-only `accessToken` cookie. Clients should not
read or store this token in browser JavaScript.

For Axios, enable credentials:

```ts
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});
```

For `fetch`:

```ts
fetch("http://localhost:5000/api/v1/auth/me", {
  credentials: "include",
});
```

### Current user

```http
GET /api/v1/auth/me
```

Requires the authentication cookie.

### Logout

```http
POST /api/v1/auth/logout
```

### Token data

The access token identifies the authenticated user with values similar to:

```json
{
  "userId": "USER_ID",
  "role": "BUSINESS_ADMIN",
  "restaurantId": "RESTAURANT_ID"
}
```

`SUPER_ADMIN` is not required to have a `restaurantId`. Restaurant-specific
users must have one.

---

## Multi-tenant data isolation

Tenant isolation is a core security rule.

### Never send `restaurantId` from the client

For restaurant-owned resources, send only the resource data:

```json
{
  "name": "Main Course"
}
```

Do not send this:

```json
{
  "name": "Main Course",
  "restaurantId": "some_other_restaurant"
}
```

The backend obtains the restaurant ID from the authenticated request:

```text
JWT
  → authMiddleware
  → req.user.restaurantId
  → controller
  → service
```

Every tenant-owned query must filter by `restaurantId`. This prevents a user
from reading or changing another restaurant's data.

### Middleware responsibilities

| Middleware | Responsibility |
| --- | --- |
| `authMiddleware` | Verifies the access token and populates `req.user` |
| `tenantMiddleware` | Requires valid restaurant context for tenant routes |
| `authorizeRoles(...)` | Allows only the configured account roles |
| Upload middleware | Validates and stores incoming image files in memory |

---

## API reference

The API prefix is:

```text
/api/v1
```

Unless marked **Public**, routes require the authentication cookie. Resource
routes also apply tenant and role checks as configured in the route layer.

### Health

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Public |

### Authentication

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Public |
| `POST` | `/api/v1/auth/logout` | Authenticated |
| `GET` | `/api/v1/auth/me` | Authenticated |

### Restaurants

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/restaurants` | `SUPER_ADMIN` |

Restaurant creation supports a logo upload. See [File uploads](#file-uploads).

### Staff

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/staff` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/staff` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/staff/:staffId` | `BUSINESS_ADMIN` |
| `PATCH` | `/api/v1/staff/:staffId` | `BUSINESS_ADMIN` |
| `DELETE` | `/api/v1/staff/:staffId` | `BUSINESS_ADMIN` |

Staff management covers both `STAFF` and `KITCHEN_STAFF` accounts.

### Categories

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/categories` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/categories` | `BUSINESS_ADMIN`, `STAFF` |
| `GET` | `/api/v1/categories/:categoryId` | `BUSINESS_ADMIN`, `STAFF` |
| `PATCH` | `/api/v1/categories/:categoryId` | `BUSINESS_ADMIN` |
| `DELETE` | `/api/v1/categories/:categoryId` | `BUSINESS_ADMIN` |

### Menu items

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/menu-items` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/menu-items` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `GET` | `/api/v1/menu-items/:menuItemId` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `PATCH` | `/api/v1/menu-items/:menuItemId` | `BUSINESS_ADMIN` |
| `DELETE` | `/api/v1/menu-items/:menuItemId` | `BUSINESS_ADMIN` |

Menu item creation and updates can include an image upload.

### Tables

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/tables` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/tables` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `GET` | `/api/v1/tables/:tableId` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `PATCH` | `/api/v1/tables/:tableId` | `BUSINESS_ADMIN` |
| `DELETE` | `/api/v1/tables/:tableId` | `BUSINESS_ADMIN` |

Table statuses are:

```text
AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE
```

### Rooms

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/rooms` | `BUSINESS_ADMIN` |
| `GET` | `/api/v1/rooms` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `GET` | `/api/v1/rooms/:roomId` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `PATCH` | `/api/v1/rooms/:roomId` | `BUSINESS_ADMIN` |
| `DELETE` | `/api/v1/rooms/:roomId` | `BUSINESS_ADMIN` |

Room statuses are:

```text
AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE
```

Room listing supports pagination:

```http
GET /api/v1/rooms?page=1&limit=10
```

### Orders

| Method | Endpoint | Allowed role |
| --- | --- | --- |
| `POST` | `/api/v1/orders` | `BUSINESS_ADMIN`, `STAFF` |
| `GET` | `/api/v1/orders` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `GET` | `/api/v1/orders/:orderId` | `BUSINESS_ADMIN`, `STAFF`, `KITCHEN_STAFF` |
| `PATCH` | `/api/v1/orders/:orderId/status` | `BUSINESS_ADMIN`, `KITCHEN_STAFF` |
| `POST` | `/api/v1/orders/:orderId/cancel` | `BUSINESS_ADMIN`, `STAFF` |

Order statuses are:

```text
PENDING | PREPARING | READY | COMPLETED | CANCELLED
```

An order belongs to one restaurant and may reference a table or a room. The
order service validates the restaurant and related resource ownership before
performing operations.

### Modules not currently mounted

The following sections from the original product plan do not have active routes
yet:

- Bookings
- Reports
- Analytics

Do not call endpoints for these modules until their route files are added and
mounted in `backend/app.ts`.

---

## File uploads

Cloudinary stores restaurant logos and menu item images. The database stores the
Cloudinary URL and `publicId`, which is needed when an image is deleted.

Current limits:

| File | Maximum size | Allowed types |
| --- | ---: | --- |
| Restaurant logo | 2 MB | JPEG, PNG, WebP |
| Menu item image | 5 MB | JPEG, PNG, WebP |

Upload processing uses Multer memory storage before the file is sent to
Cloudinary.

Images are organized by restaurant:

```text
restaurants/
└── {restaurantId}/
    ├── logo/
    └── menu/
```

Use `multipart/form-data` for endpoints that accept images. The exact form field
names are defined by the upload middleware and validators in the backend.

---

## Pagination

Reusable pagination helpers are in `backend/src/utils/pagination.ts`.

Default values:

```text
page  = 1
limit = 10
```

The maximum page size is `100`.

Paginated responses include:

```text
page
limit
total
totalPages
hasNextPage
hasPreviousPage
```

Example:

```http
GET /api/v1/rooms?page=1&limit=10
```

---

## Database and transactions

MongoDB is the source of truth. Redis is not currently required or used as the
primary data store.

Use a transaction only when multiple database operations must succeed or fail
together. Typical examples include:

- Creating or cancelling an operation that updates multiple documents
- Reserving a shared table or room
- Completing a multi-step order workflow

Transactions require a MongoDB replica set. MongoDB Atlas supports transactions;
local development can use a replica set named `rs0`.

Tables and rooms should not store `orderId` or `bookingId`. Relationships belong
on the dependent documents:

```text
Order.tableId
Order.roomId
Booking.tableId
Booking.roomId
```

---

## Development rules

1. **Never trust `restaurantId` from the client.** Use the authenticated user
   context.
2. **Filter every tenant-owned query by `restaurantId`.**
3. **Keep controllers thin.** Put business logic in services.
4. **Validate request data before calling services.** Use the existing Zod
   schemas.
5. **Use typed models and existing helpers.** Avoid duplicating pagination,
   authentication, and ownership checks.
6. **Do not use MongoDB transactions for single-document operations.**
7. **Keep frontend clients separate from MongoDB.** Web and mobile clients
   should communicate through the REST API.
8. **Do not commit secrets.** Keep credentials in `backend/src/.env`.

---

## Current status and roadmap

### Implemented

- Express and TypeScript backend
- MongoDB and Mongoose integration
- Environment-based configuration
- API versioning under `/api/v1`
- JWT authentication with HTTP-only cookies
- Password hashing
- Role-based authorization
- Restaurant creation
- Multi-tenant restaurant isolation
- Staff and kitchen staff management
- Categories
- Menu items and Cloudinary images
- Tables
- Rooms
- Pagination utilities
- Orders and order-status workflow
- Helmet, CORS, request logging, and Zod validation

### Planned

- Table and room bookings
- Booking conflict validation and transactions
- Revenue reports
- Staff and order analytics
- Redis caching and rate limiting
- Socket.IO real-time order updates
- Swagger/OpenAPI documentation
- Next.js web dashboard
- Flutter mobile application
- Notifications and audit logs

---

## Security checklist

- [x] Password hashing
- [x] JWT authentication
- [x] HTTP-only authentication cookie
- [x] Role-based authorization
- [x] Tenant isolation
- [x] Helmet
- [x] CORS
- [x] Zod request validation
- [x] File type validation
- [x] File size limits
- [ ] Rate limiting
- [ ] Refresh-token rotation
- [ ] Audit logging
- [ ] Advanced security monitoring

---

## License 

This project uses the ISC license declared in `backend/package.json`.

