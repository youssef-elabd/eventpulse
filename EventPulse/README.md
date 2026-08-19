# EventPulse API

Event Management Backend API — built for the JavaScript Backend Essentials, Level 4 Semester 2 project. Attendees browse and register for events with capacity limits; admins manage events and push live announcements over Socket.io.

> Rename this project folder to your submission naming convention: **`<StudentID>-EventPulse`**.

## 1. Project Description

EventPulse is a full event-management REST + real-time API. Events belong to categories, attendees register with capacity enforcement, and admins broadcast live announcements to an event's attendees that are also persisted for late joiners. The project applies authentication/JWT, advanced Mongoose querying, input validation, Socket.io, automated testing, and deployment end to end.

## 2. Tech Stack

- **Runtime**: Node.js, Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: bcryptjs, jsonwebtoken
- **Validation**: express-validator
- **Real-time**: Socket.io
- **Docs**: swagger-jsdoc + swagger-ui-express
- **Testing**: Jest + Supertest + mongodb-memory-server
- **Deployment**: Vercel (REST API) — see the Socket.io note below

## 3. Project Structure

```
EventPulse/
├── api/                 # Vercel serverless entry point
├── config/              # db.js, swagger.js
├── controllers/         # business logic
├── middleware/          # requireAuth, requireRole, validate, errorMiddleware
├── models/              # User, Category, Event, Registration, Message
├── routes/               
├── seed/                # database seed script
├── sockets/             # Socket.io room/connection handling
├── frontend/            # plain HTML/CSS/JS UI, no build step, served by app.js
│   ├── css/style.css
│   ├── js/               api.js (shared client), index.js, event.js, admin.js
│   ├── index.html         browse/filter/search events
│   ├── event.html         event detail, register, live announcements
│   ├── login.html / register.html
│   ├── my-events.html     registrations + cancel
│   └── admin.html         create events, manage categories
├── tests/
│   ├── unit/             # AppError, asyncHandler
│   └── integration/      # Events API (Supertest)
├── utils/                # AppError, asyncHandler, generateToken
├── validators/           # express-validator rule chains
├── app.js                # Express app (API + static frontend; no listen — used by tests too)
├── server.js             # HTTP + Socket.io entry point for local/traditional hosting
├── .env.example
└── vercel.json
```

### Frontend

The UI is plain HTML/CSS/JS (no framework, no build step) served by the same Express app at `/`, so `npm run dev` gives you the whole working site at `http://localhost:5000`. It talks to the API via `fetch` and connects to Socket.io for live announcements on the event page. A JWT and cached user profile are the only things kept in `localStorage`; cart-equivalent state (registrations) always comes fresh from the API.

## 4. Installation & Setup

```bash
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm run seed               # creates categories, sample events, and an admin user
npm run dev                 # http://localhost:5000
```

Seeded admin login: `admin@eventpulse.com` / `Admin@1234`

## 5. Running Tests

```bash
npm test
```

- `tests/unit` — AppError and asyncHandler, success and failure cases.
- `tests/integration` — Events API against an in-memory MongoDB via Supertest (create, list, filter, 404, validation).

## 6. API Overview

Full interactive docs at **`/api-docs`** once the server is running. Summary:

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (attendee by default) |
| POST | `/api/auth/login` | Public | Log in, get JWT |
| GET | `/api/auth/me` | Private | Current user |
| GET | `/api/categories` | Public | List categories |
| POST/PATCH/DELETE | `/api/categories(/:id)` | Admin | Manage categories |
| GET | `/api/events` | Public | Filter/paginate/sort/search events |
| POST | `/api/events` | Admin | Create event |
| GET/PATCH/DELETE | `/api/events/:id` | Public/Admin | Read/update/delete an event |
| POST | `/api/events/:eventId/register` | Private | Register for an event |
| GET | `/api/registrations/me` | Private | My registrations |
| DELETE | `/api/registrations/:id` | Private | Cancel a registration |
| GET/POST | `/api/events/:eventId/announcements` | Private/Admin | Announcement history / broadcast |
| GET | `/health` | Public | Server + DB status |

**Query params on `GET /api/events`**: `category`, `city`, `dateFrom`, `dateTo`, `search`, `sort` (`date` \| `-date` \| `popularity`), `page`, `limit`.

**Socket.io**: connect, then `socket.emit('joinEvent', eventId)` to receive `announcement` events for that event in real time.

## 7. Deployment & Git Workflow

- **Database**: MongoDB Atlas cluster, connection string in `MONGO_URI`.
- **REST API on Vercel**: `api/index.js` wraps the Express app as a serverless function; `vercel.json` routes all traffic to it. Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` in the Vercel project's environment variables.
- **Socket.io caveat**: standard Vercel serverless functions don't hold persistent WebSocket connections. `server.js` (used by `npm start`/`npm run dev`) runs the full REST + Socket.io stack and is what you should deploy to a persistent host (Render, Railway, Fly.io, a VM) if you need the real-time layer live in production alongside the Vercel deployment. The REST API, `/health`, and `/api-docs` all work correctly on Vercel either way.
- **Git**: commit using Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), tag the final commit `v1.0.0`, and open a Pull Request describing the work before merging to `main`.
- **Submission**: share the GitHub repo link and the deployed Vercel URL, both set to "Anyone can view."

## Postman Collection

`postman/EventPulse.postman_collection.json` — import alongside a Postman Environment defining `baseUrl` (e.g. `https://<your-app>.vercel.app`) and `token` (set automatically by the login/register request's test script). Every request uses `{{baseUrl}}` and `{{token}}` instead of hardcoded values.
