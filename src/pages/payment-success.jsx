import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("bookingId");
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (sessionId && bookingId && userId) {
      updatePaymentStatus();
    }
  }, [sessionId, bookingId, userId]);

  const updatePaymentStatus = async () => {
    try {
      await axios.post(
        "https://rentgaadi-backend.onrender.com/api/payment/success",
        {
          sessionId,
          bookingId,
          userId,
        }
      );
      // console.log("Payment and Booking updated successfully!");
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  return (
    <div className="text-center p-5 pt-30">
      <h1 className="text-green-600 text-2xl font-bold">Payment Successful!</h1>
      <p>Booking Confirmed ✅</p>
      <br />
      <button
        onClick={() => navigate("/Dashboard")}
        className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
