# 🚗 Online Vehicle Rental System

A full-featured **MERN Stack** application that allows users to browse, book, and review vehicles for rent. It includes role-based dashboards, secure authentication, payment integration, and admin management tools.

## 🔧 Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Context API (for Auth & State Management)
- Axios

**Backend:**
- Node.js with ES Modules
- Express.js
- MongoDB with Mongoose
- Cloudinary (for image storage)
- Stripe (for payments)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Multer (for file handling)

---

## 📚 Features

### 🚙 User Panel
- Signup/Login with JWT
- View available vehicles
- Search & filter vehicles
- Book vehicles with date/time
- Stripe payment integration
- View "My Bookings" with order tracking
- Submit review & rating (modal-based)
- Edit profile

### 🛠️ Admin Panel
- Role-based redirection after login
- Create, update, and delete vehicle listings
- Upload/delete vehicle images to Cloudinary
- View all registered users
- View all bookings and payment history

---

## ⚙️ Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/online-vehicle-rental-system.git
cd online-vehicle-rental-system
