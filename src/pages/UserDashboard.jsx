import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchUserPayments(user._id);
    }

    fetchVehicles();
  }, [user]);

  // Fetch payments
  const fetchUserPayments = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/users&bookings&payments/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching user payments", error);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vehicle/getAllVehicles"
      );
      setVehicles(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching vehicles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pt-25">
      {/* ===== Payments Section ===== */}
      <h1 className="text-2xl font-bold mb-4">My Completed Payments</h1>
      <div className="grid gap-4 mb-10">
        {payments.length === 0 ? (
          <p>No payment history found.</p>
        ) : (
          payments.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow rounded-xl p-4 border"
            >
              <p>
                <span className="font-semibold">Amount:</span> ₹{item.amount}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {item.status}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span>{" "}
                {item.paymentMethod}
              </p>
              <p>
                <span className="font-semibold">Transaction ID:</span>{" "}
                {item.transactionId}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Booking Status:</span>{" "}
                {item.booking?.status}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ===== Featured Vehicles Section ===== */}
      <section className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">
          Featured Vehicles
        </h2>

        {loading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.length > 0 ? (
                vehicles.slice(0, 4).map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <img
                      src={vehicle.images || "/default-image.jpg"}
                      alt={vehicle.model}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h2 className="text-2xl font-semibold">{`${vehicle.make} ${vehicle.model}`}</h2>
                    <p className="text-gray-600">{vehicle.year}</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{vehicle.pricePerDay}/day
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No vehicles found</p>
              )}
            </div>

            {/* Browse More Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate("/")}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition duration-200"
              >
                Browse More
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
