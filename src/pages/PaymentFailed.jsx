import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    alert("Payment failed! Please try again.");

    navigate("/");
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">Payment Failed!</h1>
      <p className="text-lg text-gray-600 mt-2">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={() => navigate("/")}
        className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default PaymentFailed;
