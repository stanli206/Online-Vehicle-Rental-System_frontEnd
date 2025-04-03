import { useContext, useEffect } from "react";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./admin/AdminDashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/payment-success";

function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("User data from AuthContext:", user);
  }, [user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="payment-success" element={<PaymentSuccess />} />

        <Route
          path="/admin"
          element={
            user && user.role?.toLowerCase() === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
