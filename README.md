# 💰 Expense Management System

A full-stack **Expense Management System** built using the **MERN Stack**.
The application allows users to securely register and log in, manage their personal expenses, search and filter transactions, and analyze their spending through dashboards, reports, and charts.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [System Architecture](#️-system-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#️-prerequisites)
- [Installation and Setup](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#️-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Database Design](#️-database-design)
- [Security](#-security)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Project Information](#-project-information)

---

## 📌 Project Overview

The **Expense Management System** is a web-based application designed to help users efficiently record, manage, and analyze their expenses.

The system provides a secure authentication mechanism and ensures that each user can access only their own expense records.

Users can:

- Create and manage expenses
- View their total and recent expenses
- Search and filter transactions
- Sort expenses according to different criteria
- Analyze spending patterns
- View category-wise and monthly spending reports
- Visualize expenses using interactive charts

The application follows a client-server architecture with a **React frontend**, **Express.js backend**, and **MongoDB database**.

---

## ✨ Features

### 🔐 User Authentication

- User registration
- User login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Persistent authentication using local storage
- Logout functionality

### 💸 Expense Management

- Add new expenses
- View all expenses
- View individual expenses
- Edit existing expenses
- Delete expenses
- Assign categories to expenses
- Add descriptions
- Select expense dates
- User-specific expense management

### 🔎 Search, Filter & Sort

Expenses can be:

- Searched by title or description
- Filtered by category
- Filtered by month
- Sorted by:
  - Newest first
  - Oldest first
  - Highest amount
  - Lowest amount

### 📊 Dashboard

The dashboard provides:

- Total spending
- Number of expenses
- Current month's spending
- Recent expenses
- Category-wise spending chart
- Monthly spending chart
- Quick access to expense management

### 📈 Reports & Analytics

The reports section provides:

- Total spending
- Average expense
- Highest expense
- Most used category
- Number of expenses
- Category-wise spending breakdown
- Monthly spending breakdown
- Complete transaction history
- Pie chart visualization
- Bar chart visualization

### 📱 Responsive Interface

- Responsive layout
- Mobile-friendly design
- Clean navigation
- User-friendly forms and interfaces

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React.js | User interface |
| Create React App | React application setup |
| React Router | Client-side routing |
| Axios | API communication |
| Recharts | Data visualization |
| CSS | Styling and responsive design |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## 🏗️ System Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│                             │
│  Login / Register           │
│  Dashboard                  │
│  Expenses                   │
│  Reports                    │
└──────────────┬──────────────┘
               │
               │ Axios / HTTP
               ▼
┌─────────────────────────────┐
│       Express.js API        │
│                             │
│  Authentication Routes      │
│  Expense Routes             │
│  Controllers                │
│  Authentication Middleware  │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│          MongoDB            │
│                             │
│  Users Collection            │
│  Expenses Collection         │
└─────────────────────────────┘
```

---

## 📁 Project Structure

```text
expense-management-system/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   └── indexController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── indexRoutes.js
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpenseCard.js
│   │   │   ├── ExpenseFilters.js
│   │   │   ├── ExpenseForm.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Expenses.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Reports.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── expenseService.js
│   │   │
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

> **Note:** The `backend/.env` file is required for local configuration but is intentionally excluded from GitHub for security reasons.

---

## ⚙️ Prerequisites

Before running the project, make sure the following are installed:

| Requirement | Purpose |
|-------------|---------|
| Node.js | Run frontend and backend |
| npm | Install project dependencies |
| MongoDB | Store application data |
| Git | Clone and manage the repository |

---

## 📥 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-management-system.git
cd expense-management-system
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure MongoDB

Make sure MongoDB is installed and running on your system.

The application uses MongoDB to store:

- User accounts
- Expense records

### 4. Configure Environment Variables

Inside the `backend` folder, create a `.env` file with the variables listed in [Environment Variables](#-environment-variables) below.

### 5. Install Frontend Dependencies

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

---

## 🔑 Environment Variables

The backend requires the following environment variables:

| Variable | Description |
|----------|--------------|
| `PORT` | Port on which the backend server runs |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to generate and verify JWT tokens |

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_management
JWT_SECRET=your_secure_secret_key
```

⚠️ **Security Notice:** Never upload your `.env` file to GitHub. It contains sensitive configuration information and is excluded using `.gitignore`.

---

## ▶️ Running the Application

The frontend and backend need to run simultaneously.

### Start the Backend

Open Terminal 1:

```bash
cd backend
npm start
```

Backend server:

```
http://localhost:5000
```

### Start the Frontend

Open Terminal 2:

```bash
cd frontend
npm start
```

Frontend application:

```
http://localhost:3000
```

Once both servers are running, open the frontend URL in your browser.

---

## 🔌 API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|--------------|-----------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login an existing user | No |

### Expense APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|--------------|-----------------|
| POST | `/api/expenses` | Create an expense | Required |
| GET | `/api/expenses` | Get user's expenses | Required |
| GET | `/api/expenses/:id` | Get a specific expense | Required |
| PUT | `/api/expenses/:id` | Update an expense | Required |
| DELETE | `/api/expenses/:id` | Delete an expense | Required |

### Health Check

```
GET /
```

Response:

```json
{
  "message": "Expense Management System API is running"
}
```

---

## 🗄️ Database Design

The application uses MongoDB with two main collections.

### User

```
User
│
├── name
├── email
├── password
└── createdAt
```

### Expense

```
Expense
│
├── userId
├── title
├── amount
├── category
├── description
├── date
└── createdAt
```

Each expense is associated with the user who created it through `userId`.

---

## 🔒 Security

The application implements the following security mechanisms:

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Protected API routes require a valid JWT
- Authentication middleware validates JWT tokens
- User ID is obtained from the authenticated token
- Users can access only their own expenses
- Users cannot modify or delete another user's expenses
- Passwords are never returned in API responses
- Sensitive environment variables are excluded from Git

---

## 🧪 Testing

Core functionality — authentication, expense CRUD, search/filter/sort, dashboard calculations, reports and charts, user-specific access control, and the responsive interface — has been manually tested end-to-end.

### Production Build

To create an optimized production build:

```bash
cd frontend
npm run build
```

A successful build generates the production files inside the `frontend/build` directory.

The build directory is excluded from GitHub using `.gitignore`.

---

## 🎯 Future Enhancements

Possible future improvements include:

- Budget management
- Monthly spending limits
- Recurring expenses
- Expense reminders
- PDF/CSV report export
- Email notifications
- Advanced spending analytics
- Dark mode
- Mobile application
- Cloud deployment

---

## 👨‍💻 Project Information

| Information | Details |
|--------------|---------|
| Project Name | Expense Management System |
| Project Type | Full-Stack Web Application |
| Architecture | Client-Server Architecture |
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT |
| Data Visualization | Recharts |

*(See [Technology Stack](#️-technology-stack) above for the full list of libraries and tools.)*