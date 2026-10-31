# JobTrack · Job Application Tracking & Discovery System

**JobTrack** is a production-ready, full-stack MERN (MongoDB Atlas, Express.js, React, Node.js) web application designed for students and job seekers to manage, monitor, and organize their job applications, interview schedules, offers, and tracked companies in one centralized workspace.

Developed as a **BCA-V Semester Major Project** at **School of Computer Application & Technology, Career Point University, Kota**.
- **Developer:** Krish Galav (KID: K25707)
- **Project Supervisor:** Mr. Parveen Kr. Goyal

---

## 🌟 Key Features

1. **Live India Job Discovery & Auto-Aggregator (`/job-search`)**:
   - Aggregates verified tech jobs in India across Bangalore, Hyderabad, Pune, Gurugram, Mumbai, and Remote India.
   - Filter by tech stack, target role, and location.
   - **1-Click "Apply & Track"**: Opens the verified career page in a new tab and automatically logs the application into your personal tracker with status `Applied`.
   - **Permanent Preservation Architecture**: Even if an employer listing closes on the feed, your personal tracking history remains permanently saved.

2. **Personalized Job Tracker (`/trackers`)**:
   - Track `company`, `role`, `location`, `type` (*Job* / *Internship*), `salary` (INR), `appliedDate`, `jobUrl`, and `notes`.
   - Pipeline statuses: `Applied`, `Shortlisted`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
   - Real-time search, status filter, and multi-criteria sorting.
   - Stage progress bar, analytics overview, and quick-action menu.

3. **Interview Rounds Tracking**:
   - Nested interview round scheduling (`round`, `type`, `date & time`, `meetingLink`, `notes`).
   - Supports Technical, HR, Managerial, Aptitude, Group Discussion, and Other interview formats.
   - Direct meeting links for upcoming rounds.

4. **Offer Management**:
   - Track offered CTC (INR), expected joining date, decision deadline, and status (`Pending`, `Accepted`, `Declined`).

5. **Company Tracker (`/companies`)**:
   - Track target hiring companies, domain industries, career portal links, application statuses, and interview count.

6. **Authentication & User Profile (`/login`, `/register`)**:
   - Secure registration and authentication using **JWT** and **bcrypt**.
   - Target job title onboarding and personalized preference settings.
   - Complete data isolation: each user securely owns and accesses only their data.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies | Responsibilities |
|---|---|---|
| **Frontend** | React 18 (Vite SPA), React Router v6, Bootstrap 5, Axios, Lucide React Icons | Responsive UI, teal design system, client-side filtering, state management |
| **Backend** | Node.js, Express.js REST API, JWT Middleware, Mongoose ODM | REST endpoints, authentication, data validation, business logic |
| **Database** | MongoDB Atlas (Cloud Database) | Cloud persistence, user schemas, nested interviews, secure indexes |

---

## 📁 Project Structure

```text
Krish_Project/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx       # Generic deletion confirmation modal
│   │   │   ├── InterviewModal.jsx     # Add/edit interview modal
│   │   │   ├── Navbar.jsx             # Top navigation with user menu & sign out
│   │   │   ├── ProtectedRoute.jsx     # Route authentication guard
│   │   │   └── StatusBadge.jsx        # Color-coded status badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT session & user state
│   │   ├── pages/
│   │   │   ├── ApplicationDetail.jsx  # Application details, timeline & rounds
│   │   │   ├── ApplicationForm.jsx    # Add / edit application form
│   │   │   ├── CompanyTracker.jsx     # Target companies directory
│   │   │   ├── JobSearch.jsx          # Live India job search & 1-click track
│   │   │   ├── JobTracker.jsx         # Main applications tracker & pipeline
│   │   │   ├── Login.jsx              # Clean sign-in page
│   │   │   ├── NotFound.jsx           # 404 page
│   │   │   ├── Register.jsx           # Clean user registration page
│   │   │   └── TitleOnboarding.jsx    # Target roles onboarding setup
│   │   ├── App.jsx                    # Routing configuration
│   │   ├── index.css                  # Theme & custom styling
│   │   └── main.jsx                   # Vite entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/
│   ├── config/
│   │   └── db.js                      # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── applicationController.js   # Application & interview CRUD
│   │   ├── authController.js          # User registration, login & profile
│   │   └── companyController.js       # Tracked companies & similarity
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification middleware
│   │   └── errorHandler.js            # Centralized error handler
│   ├── models/
│   │   ├── Application.js             # Mongoose application schema
│   │   ├── Company.js                 # Tracked company schema
│   │   ├── JobFeed.js                 # Live job feed cache schema
│   │   └── User.js                    # User profile & target titles schema
│   ├── routes/
│   │   ├── applicationRoutes.js       # /api/applications endpoints
│   │   ├── authRoutes.js              # /api/auth endpoints
│   │   ├── companyRoutes.js           # /api/companies endpoints
│   │   └── jobRoutes.js               # /api/jobs endpoints
│   ├── services/
│   │   ├── companySimilarityService.js# Company metadata service
│   │   └── jobFeedService.js          # Live job sync service
│   ├── server.js                      # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── package.json                       # Monorepo build & deployment orchestrator
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24 LTS)
- **npm** v9+

### 2. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Krish_Project

# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 3. Environment Variables
Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.0mu8sg9.mongodb.net/jobtrack?retryWrites=true&w=majority
JWT_SECRET=jobtrack_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in `client/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers
In two separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start tracking applications.

---

## 🌐 Production Deployment

The project is structured with a root `package.json` for one-click deployment on platforms such as **Render**, **Railway**, or **Heroku**:

1. **Build Command**: `npm run build` (installs dependencies and builds the React frontend to `client/dist`)
2. **Start Command**: `npm start` (launches the production Express server which serves the API and static frontend bundle)
3. Set `NODE_ENV=production` and your `MONGODB_URI` and `JWT_SECRET` in your host's environment settings.

---

## 👨‍🎓 Project Credits
- **Developer:** Krish Galav (BCA-V Semester)
- **Institution:** School of Computer Application & Technology, Career Point University, Kota
- **Project Supervisor:** Mr. Parveen Kr. Goyal
