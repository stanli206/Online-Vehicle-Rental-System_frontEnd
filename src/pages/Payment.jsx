import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaIndianRupeeSign } from "react-icons/fa6";

const Payment = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Get booking data from location state
  const booking = location.state?.booking;
  const vehicle = booking?.vehicle;

  const handlePayment = async () => {
    if (!booking || !user) {
      setError("Booking information missing");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://rentgaadi-backend.onrender.com/api/payment/createPayment", // Updated endpoint
        {
          bookingId: booking.id,
          paymentMethod: "card",
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Error state - if no booking data
  if (!booking || !vehicle) {
    return (
      <div className="container mx-auto p-6 text-center mt-20">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="mb-6">Please start your booking process again.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="container mx-auto p-6 pt-28">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          Complete <span className="text-yellow-600 ">Payment</span>
        </h2>

        <div className="mb-6 bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Your Booking:</h3>
          <p>ID : {booking.id}</p>
          <p>
            Vehicle : {vehicle.make} {vehicle.model}
          </p>
          <p>Start : {booking.start}</p>
          <p>End : {booking.end}</p>
          <p>total Days : {booking.totalDays}</p>

          <p className="flex items-center text-lg font-bold text-gray-800 space-x-1">
            Total:
            <span className="flex items-center">
              <FaIndianRupeeSign className="text-base mt-[1px]" />
              {booking.totalPrice}
            </span>
          </p>
          {/* <p>
             <FaIndianRupeeSign className="text-base mt-[1px]" />
            {booking.totalPrice}
          </p> */}
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3 text-black border border-black rounded-md transition duration-200 font-medium ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "hover:bg-yellow-600"
          }`}
        >
          {isProcessing ? "Processing..." : "Pay with card"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
