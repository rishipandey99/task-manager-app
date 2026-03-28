# 📝 Task Manager Web App

## 📌 Overview

Task Manager Web App is a full-stack application that helps users manage their daily tasks efficiently. It allows users to create, update, delete, and track tasks with authentication support.

---

## 🚀 Features

* 🔐 User Authentication (Login/Register)
* ➕ Add new tasks
* ✏️ Update existing tasks
* ❌ Delete tasks
* 📋 View all tasks
* ✅ Mark tasks as completed

---

## 🛠️ Tech Stack

### Frontend:

* React.js
* HTML, CSS, JavaScript

### Backend:

* Node.js
* Express.js

### Database:

* MongoDB

---

## 📁 Project Structure

```
task-manager-app/
 ├── frontend/
 ├── backend/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/rishipandey99/task-manager-app.git
cd task-manager-app
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 API Endpoints

### Auth Routes:

* POST /api/auth/register
* POST /api/auth/login

### Task Routes:

* GET /api/tasks
* POST /api/tasks
* PUT /api/tasks/:id
* DELETE /api/tasks/:id

---

## 👨‍💻 Author

Rishi Pandey

---

## ⭐ Future Improvements

* Add task priority levels
* Add due dates & reminders
* Deploy on cloud (Render/Vercel)
