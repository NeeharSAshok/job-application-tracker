# 🎯 Job Application Tracker

A full-stack web application to manage, organize, and visualize your job search.
Built with **Spring Boot**, **Spring Security + JWT**, **React**, and **Recharts**.

![Stack](https://img.shields.io/badge/Java-17-orange?style=flat-square)
![Stack](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?style=flat-square)
![Stack](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Stack](https://img.shields.io/badge/DB-H2%20%7C%20MySQL-informational?style=flat-square)

---

## ✨ Features

| Feature | Detail |
|---|---|
| **JWT Auth** | Register/login with BCrypt-hashed passwords and stateless JWT sessions |
| **Kanban Board** | Drag-and-drop cards across 6 columns: Wishlist → Applied → OA/Test → Interview → Offer → Rejected |
| **Analytics Dashboard** | Bar chart (applications over time), Donut chart (status breakdown), summary stat cards |
| **CRUD Applications** | Add, edit, delete with company, role, location, notes, follow-up date, and job URL |
| **Zero-Cost Database** | Runs with H2 in-memory out of the box. Switch to MySQL via a single env flag |
| **Docker Support** | One-command `docker compose up` to run the full stack |

---

## 🛠️ Tech Stack

### Backend
- Java 17 + Spring Boot 3.2.5
- Spring Security (JWT-based stateless auth, BCrypt)
- Spring Data JPA + Hibernate
- H2 (dev) / MySQL (prod)
- JJWT 0.12.5
- Lombok

### Frontend
- React 18 + React Router 6
- Recharts (charts/graphs)
- Axios (HTTP with JWT interceptors)
- HTML5 Drag and Drop API (Kanban)
- Pure CSS custom design system (no UI library dependency)

---

## 🚀 Quick Start (Local — H2, no setup needed)

### Prerequisites
- Java 17+
- Node.js 18+ / npm
- Maven 3.9+

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/job-application-tracker.git
cd job-application-tracker
```

### 2. Start the backend
```bash
cd backend
mvn spring-boot:run
```
API runs at `http://localhost:8080`
H2 console at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:jobtrackerdb`)

### 3. Start the frontend
```bash
cd frontend
npm install
npm start
```
App opens at `http://localhost:3000`

---

## 🐳 Docker (Full Stack + MySQL)

```bash
docker compose up --build
```

- Frontend → `http://localhost:3000`
- Backend API → `http://localhost:8080`
- MySQL → `localhost:3306` 

---

## 🔄 Switch to MySQL (without Docker)

1. Create a MySQL database:
```sql
CREATE DATABASE jobtrackerdb;
```

2. Run with the mysql profile:
```bash
cd backend
DB_USERNAME=root DB_PASSWORD=yourpassword \
  mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |

### Applications (all require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | Get all your applications |
| POST | `/api/applications` | Create application |
| PUT | `/api/applications/{id}` | Update application |
| PATCH | `/api/applications/{id}/status` | Update status only (used by Kanban drag) |
| DELETE | `/api/applications/{id}` | Delete application |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/dashboard` | Dashboard stats + timeline |

---

## 📁 Project Structure

```
job-application-tracker/
├── backend/
│   ├── src/main/java/com/jobtracker/
│   │   ├── config/          # SecurityConfig, CORS
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA entities + enums
│   │   ├── exception/       # Global exception handler
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # JWT filter, UserDetailsService
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ApplicationModal
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, KanbanPage
│   │   └── services/        # Axios API service
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🎤 Interview Talking Points

- **JWT flow**: explain token generation on login → Bearer header on requests → filter validation
- **Stateless sessions**: why SessionCreationPolicy.STATELESS matters for scalability
- **Optimistic UI updates**: Kanban drag updates locally first, rolls back if API fails
- **Repository projections**: `StatusCount` interface in `JobApplicationRepository` for grouped queries
- **Global exception handling**: `@RestControllerAdvice` for clean, consistent error responses
- **H2 → MySQL portability**: Spring profiles with zero code change

---

## 👤 Neehar S Ashok

**Neehar S Ashok**
- GitHub: [github.com/NeeharSAshok](https://github.com/NeeharSAshok)
- LinkedIn: [linkedin.com/in/neehar-s-ashok-b88290261](https://linkedin.com/in/neehar-s-ashok-b88290261)
