import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/Home");
  };
  return (
    <nav>
      {isAdmin && <Link to="/admin">Amin</Link>}
      {user && !isAdmin && <Link> My Booking</Link>}
      {user ? (
        <button onClick={handleLogout}>LogOut</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
