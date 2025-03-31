import { useContext, useEffect } from "react";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./admin/AdminDashboard";

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
