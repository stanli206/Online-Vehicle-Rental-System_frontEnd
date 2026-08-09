# 🚗 Online Vehicle Rental System

A full-featured **MERN Stack** application that allows users to browse, book, and review vehicles for rent. It includes role-based dashboards, secure authentication, payment integration, and admin management tools.

---

## 🔧 Tech Stack

| **Frontend** | **Backend** |
|--------------|-------------|
| ⚛️ React.js (Vite) | 🟩 Node.js with ES Modules |
| 🎨 Tailwind CSS | 🚂 Express.js |
| 🔁 React Router DOM | 🍃 MongoDB with Mongoose |
| 🧠 Context API (Auth & State Management) | ☁️ Cloudinary (Image storage) |
| 📡 Axios | 💳 Stripe (Payments) |
|  | 🔐 JWT (Authentication) |
|  | 🧂 Bcrypt (Password hashing) |
  
---

## 📚 Features

| **User Panel** | **Admin Panel** |
|----------------|-----------------|
| 🔐 Signup/Login with JWT | 🔁 Role-based redirection (Admin vs User) |
| 🔍 View & search available vehicles | 🆕 Create, ✏️ Update, 🗑️ Delete vehicles |
| 📅 Book vehicles with date & time | ☁️ Upload/delete images via Cloudinary |
| 💳 Stripe payment integration | 👥 View all registered users |
| 📦 View "My Bookings" with order tracking | 📊 View bookings & completed payments |
| 🌟 Submit review & rating (modal-based) |  |
| 📝 Edit user profile |  |

---

### 📁 Folder Structure

```bash
online-vehicle-rental-system/
│
├── backend/
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route handlers
│   ├── middleware/        # JWT Auth, error handling
│   ├── config/            # DB and Cloudinary setup
│   └── index.js          # App entry point
│
├── frontend/
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth & global state
│   ├── pages/             # App screens (Home, Login, Admin, etc.)
│   ├── utils/             # API calls and helper functions
│   └── main.jsx           # Frontend entry point
│
└── README.md
```

## 🚀 Preview

| ![Screenshot 1](https://github.com/user-attachments/assets/4da43c74-b4ea-498c-a51f-7728de63a091) | ![Screenshot 2](https://github.com/user-attachments/assets/36fdc174-4465-4f5e-af5d-780bc677cc33) |
| --- | --- |
| ![Screenshot 3](https://github.com/user-attachments/assets/14a3c65b-c6fb-4966-8a8c-2dabb50690ac) | ![Screenshot 4](https://github.com/user-attachments/assets/9917bdb2-f1e2-4cca-a94c-be27659d08fd) |
| ![Screenshot 5](https://github.com/user-attachments/assets/bfe2b410-e760-485a-b712-bffb32ef1e44) |  ![Screenshot 6](https://github.com/user-attachments/assets/b0c9bcb7-468d-4b1f-96d4-83f4ccd7c73f) 


✨ **Features**:
- 🚗 Easy Vehicle Booking
- 🏍️ Bike & Car Rentals
- 📅 Date & Time Selection
- 💳 Secure Payments



## ⚙️ Installation Guide

🖥️ Backend
```
cd backend
npm install
```
🌐 Frontend
```
cd ../frontend
npm install
```

### 🧑‍💻 Author
##### Stantilin — MERN Stack Developer
<p align="left">
  <a href="https://linkedin.com/in/stan01in" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="stanli867@gmail.com" target="stanli867@gmail.com">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
  <a href="https://stantlinportfolio.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=react&logoColor=white" />
  </a>
</p>
```
### 📥 1. Clone the Repository

```
git clone https://github.com/your-username/online-vehicle-rental-system.git
cd online-vehicle-rental-system
CI/CD Test