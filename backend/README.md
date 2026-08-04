# PrepBoard Backend

Express + MongoDB backend for the PrepBoard application tracker.

## Folder Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection setup
├── controllers/
│   └── applicationController.js # Business logic for each endpoint
├── models/
│   └── Application.js           # Mongoose schema definition
├── routes/
│   └── applicationRoutes.js     # URL-to-controller mapping
├── server.js                    # App entry point
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (not committed)
└── README.md                    # This file
```

## Request Lifecycle

When a user performs an action in the UI, here is what happens:

```
React (App.jsx)
    │
    │  fetch('/api/applications')
    ▼
Vite Dev Server Proxy
    │
    │  Forwards /api/* to localhost:5000
    ▼
Express Route (applicationRoutes.js)
    │
    │  Matches HTTP method + URL pattern
    ▼
Controller (applicationController.js)
    │
    │  Runs the business logic
    ▼
Mongoose Model (Application.js)
    │
    │  Translates to MongoDB query
    ▼
MongoDB Atlas
    │
    │  Returns the result
    ▼
Controller
    │
    │  Wraps in { success, data } response
    ▼
React
    │
    │  Updates state → UI re-renders
    ▼
User sees the result
```

## API Endpoints

All endpoints return consistent JSON:

**Success:** `{ "success": true, "data": ... }`

**Failure:** `{ "success": false, "message": "Error description" }`

| Method | Endpoint                  | Description              | Status Codes  |
|--------|---------------------------|--------------------------|---------------|
| GET    | `/api/applications`       | Get all applications     | 200, 500      |
| POST   | `/api/applications`       | Create new application   | 201, 400, 500 |
| PUT    | `/api/applications/:id`   | Update an application    | 200, 400, 404, 500 |
| DELETE | `/api/applications/:id`   | Delete an application    | 200, 404, 500 |

### Example: Create an application

```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Google", "role": "SWE Intern", "status": "Applied"}'
```

## How to Start

### Prerequisites

- Node.js installed
- A MongoDB Atlas cluster with a connection string

### 1. Set up environment variables

Create a `.env` file in the `backend/` directory:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Start the backend

```bash
npm run dev
```

You should see:

```
MongoDB Connected: <your-cluster-host>
Server running on port 5000
```

### 4. Start the frontend

In a separate terminal:

```bash
cd Project
npm run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies all `/api/*` requests to `http://localhost:5000`.

## How Frontend Communicates with Backend

The frontend uses the browser `fetch()` API to talk to the backend:

1. **On page load:** `GET /api/applications` fetches all saved applications
2. **Adding:** `POST /api/applications` sends the form data as JSON
3. **Editing:** `PUT /api/applications/:id` sends the updated fields
4. **Deleting:** `DELETE /api/applications/:id` removes the record

After every create, update, or delete, the frontend re-fetches all applications from the backend. This keeps MongoDB as the single source of truth.

### Vite Proxy

During development, the frontend calls `/api/applications` (relative URL). Vite's dev server proxy forwards these requests to `http://localhost:5000`. This is configured in `Project/vite.config.js`.

## Environment Variables

| Variable    | Where Used           | Purpose                              |
|-------------|----------------------|--------------------------------------|
| `PORT`      | `server.js`          | Port the Express server listens on   |
| `MONGO_URI` | `config/db.js`       | MongoDB Atlas connection string      |

These are loaded by the `dotenv` package in `server.js` and should never be committed to version control.
