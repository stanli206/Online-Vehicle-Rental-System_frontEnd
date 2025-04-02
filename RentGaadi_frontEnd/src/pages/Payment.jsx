import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Payment = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  // Safely get booking data from location state
  const booking = location.state?.booking;
  const vehicle = booking?.vehicle;

  // Handle direct access or missing data
  useEffect(() => {
    if (!booking || !vehicle) {
      setError("Booking information not found. Please start over.");
    }
  }, [booking, vehicle]);

  // Check for Stripe redirect with session_id
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!booking || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/createPayment",
        {
          bookingId: booking._id,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError("Failed to initiate payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (sessionId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/confirmPayment",
        { session_id: sessionId }
      );

      if (response.data.message.includes("successful")) {
        setPaymentStatus("success");
      } else {
        setPaymentStatus("failed");
        setError("Payment verification failed");
      }
    } catch (err) {
      setPaymentStatus("failed");
      setError(err.response?.data?.message || "Payment verification error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show error state if data is missing
  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Payment success state
  if (paymentStatus === "success") {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="mb-6">Your booking has been confirmed.</p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // Payment failed state
  if (paymentStatus === "failed") {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Complete Your Payment
          </h2>
          
          {/* Booking Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="mb-2">
                <span className="font-medium">Vehicle:</span>{" "}
                {vehicle?.make} {vehicle?.model}
              </p>
              <p className="mb-2">
                <span className="font-medium">Dates:</span>{" "}
                {new Date(booking?.startDate).toLocaleDateString()} -{" "}
                {new Date(booking?.endDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Total Amount:</span> ₹
                {booking?.totalPrice}
              </p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
            <div className="flex gap-4 mb-4">
              {["card", "upi"].map((method) => (
                <button
                  key={method}
                  className={`px-4 py-2 border rounded-md capitalize ${
                    paymentMethod === method
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "text-gray-700"
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method === "card" ? "Credit/Debit Card" : "UPI"}
                </button>
              ))}
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !booking}
            className={`w-full py-3 rounded-md text-white ${
              isProcessing || !booking
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } transition`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Pay Now"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;