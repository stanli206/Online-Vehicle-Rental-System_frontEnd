import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
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
      await axios.post("http://localhost:5000/api/payment/success", {
        sessionId,
        bookingId,
        userId,
      });
      console.log("Payment and Booking updated successfully!");
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  return (
    <div className="text-center p-5">
      <h1 className="text-green-600 text-2xl font-bold">Payment Successful!</h1>
      <p>Booking Confirmed ✅</p>
    </div>
  );
};

export default PaymentSuccess;
