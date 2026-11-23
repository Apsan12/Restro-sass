# Restro SaaS

Restro SaaS is a multi-tenant restaurant management API. It helps restaurants
manage users, menus, tables, rooms, and orders while keeping each restaurant's
data isolated.

## Features

- JWT authentication with HTTP-only cookies
- Role-based access for `SUPER_ADMIN`, `BUSINESS_ADMIN`, `STAFF`, and
  `KITCHEN_STAFF`
- Restaurant, staff, category, menu item, table, and room management
- Order creation and status updates
- MongoDB persistence with Mongoose
- Image uploads through Cloudinary
- Request validation with Zod

## Tech stack

Node.js, TypeScript, Express 5, MongoDB, Mongoose, JWT, Zod, Multer, and
Cloudinary.

## Project structure

```text
restaurant-sass/
├── backend/
│   ├── src/
│   │   ├── config/       # Database and Cloudinary setup
│   │   ├── controller/   # Request handlers
│   │   ├── middleware/   # Auth, roles, tenant, and upload checks
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── validator/    # Zod schemas
│   ├── app.ts
│   ├── server.ts
│   └── package.json
└── README.md
```

## Requirements

- Node.js and npm
- MongoDB
- Cloudinary account for image uploads

MongoDB transactions require a replica set. MongoDB Atlas or a local replica
set is recommended.

## Setup

```bash
git clone <repository-url>
cd restaurant-sass/backend
npm install
```

Create `src/.env` inside the `backend/` directory:

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

## Run the API

Run these commands from `backend/`:

```bash
# Development
npm run dev

# Type-check and compile
npm run build

# Run the compiled server
npm start
```

The API runs at `http://localhost:5000` by default.

## Health check

```http
GET /api/v1/health
```

```bash
curl http://localhost:5000/api/v1/health
```

## API overview

All versioned endpoints use the `/api/v1` prefix.

| Area | Main endpoints |
| --- | --- |
| Authentication | `/auth/login`, `/auth/me`, `/auth/logout` |
| Restaurants | `/restaurants` |
| Staff | `/staff` |
| Categories | `/categories` |
| Menu items | `/menu-items` |
| Tables | `/tables` |
| Rooms | `/rooms` |
| Orders | `/orders` |

Most endpoints require the HTTP-only authentication cookie. Restaurant-owned
queries always use the authenticated user's `restaurantId`; clients should not
send or modify that value.

Bookings, reports, analytics, real-time updates, and frontend applications are
planned but are not currently available as API modules.

## Development guidelines

- Keep business logic in services and request handling in controllers.
- Validate request data with the existing Zod schemas.
- Filter every restaurant-owned query by `restaurantId`.
- Reuse existing authentication, ownership, and pagination helpers.
- Run `npm run build` before opening a pull request.

## License

This project is released under the ISC license.
