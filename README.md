# Mini CRM — Full Stack MERN Application

A complete CRM system with Authentication, Leads, Companies, Tasks, and Dashboard modules.

---

|login|
 -----
| email | salesrep1@gmail.com
| passwird | salesRep123
email: 
## 🏗️ Tech Stack

| Layer | Tech |
 -------  ----
| Frontend | React 18, React Router v6, MUI v5, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (Access Token) + bcryptjs |

---

## 📁 Project Structure

```
mini-crm/
├── backend/
│   ├── config/        # DB connection
│   ├── middleware/    # JWT auth middleware
│   ├── models/        # Mongoose schemas (User, Lead, Company, Task)
│   ├── routes/        # Express route handlers
│   ├── seed.js        # Seed script for demo data
│   ├── server.js      # Entry point
│   ├── .env.example   # Environment variables template
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── api/       # Axios instance with interceptors
        ├── components/# Layout, Sidebar
        ├── context/   # AuthContext
        └── pages/     # Dashboard, Leads, Companies, Tasks, Login
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install
# Start development server
npm run dev
# OR for frontend:
npm start
```

Backend runs on: http://localhost:5000

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: http://localhost:3000

> The `"proxy": "http://localhost:5000"` in frontend/package.json proxies all `/api` requests to the backend automatically.

---

## 🔐 Authentication & Authorization

### How it works:
1. User logs in → backend validates credentials with bcrypt → returns JWT
2. JWT stored in `localStorage`
3. All subsequent API requests include `Authorization: Bearer <token>` header
4. Backend middleware verifies JWT on every protected route
5. **Soft delete**: Leads use `isDeleted: true` flag — a Mongoose pre-query hook automatically excludes deleted leads from all normal queries

### Task Authorization:
- **Only the assigned user OR an admin** can update a task's status
- This is enforced at the API level in `PUT /api/tasks/:id`


## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List (pagination, search, filter by status) |
| GET | `/api/leads/:id` | Get single lead |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Soft delete |

**Query params for GET /api/leads:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (searches name and email)
- `status` (New | Contacted | Qualified | Lost | Won)

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all |
| GET | `/api/companies/:id` | Detail + associated leads |
| POST | `/api/companies` | Create |
| PUT | `/api/companies/:id` | Update |
| DELETE | `/api/companies/:id` | Delete |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update (status restricted to assigned user/admin) |
| DELETE | `/api/tasks/:id` | Delete |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated stats (total leads, qualified, tasks due today, completed) |

---


## 🧪 Testing with curl/Postman

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'


# 3. Get leads (use token)
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Create a lead
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","status":"New"}'
```

---

## 📋 Features Checklist

- ✅ JWT Authentication (register, login, protected routes)
- ✅ bcrypt password hashing
- ✅ Leads CRUD with pagination, search, status filter
- ✅ Soft delete for leads (never appears in normal queries)
- ✅ Companies CRUD with associated leads on detail page
- ✅ Tasks with lead assignment and user assignment
- ✅ Task status update restricted to assigned user or admin
- ✅ Dashboard with aggregated stats from MongoDB
- ✅ Persistent sidebar navigation
- ✅ Responsive MUI design
- ✅ Axios interceptors for auth headers and 401 redirect
