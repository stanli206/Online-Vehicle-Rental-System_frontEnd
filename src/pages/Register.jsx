import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) =>
      formDataObj.append(key, formData[key])
    );

    try {
      await axios.post("https://rentgaadi-backend.onrender.com/api/auth/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/login"); // Redirect after successful registration
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="w-full px-3 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {/* <input
            type="file"
            name="profilePicture"
            onChange={handleFileChange}
            className="mb-3"
          /> */}
          <button
            type="submit"
            className="w-full border border-black hover:bg-yellow-600 text-black py-2 rounded-md"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm mt-2">
          Already have an account?{" "}
          <a href="/login" className="text-green-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
