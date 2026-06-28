import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "";

const PendingPayments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/booking/booking&payment/${user._id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // "Pending payment" = booking still pending (payment not completed).
      const list = (res.data.bookings || []).filter(
        (b) => b.status === "pending"
      );
      setPending(list);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) fetchPending();
  }, [user]);

  // Build the exact booking shape the Payment page expects, then go there.
  const continuePayment = (b) => {
    const start = moment(
      `${b.startDate?.split("T")[0]} ${b.startTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const end = moment(
      `${b.endDate?.split("T")[0]} ${b.endTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const totalDays = Math.max(1, Math.ceil(end.diff(start, "hours", true) / 24));

    navigate("/payment", {
      state: {
        booking: {
          id: b._id,
          start: start.format("DD MMM YYYY, hh:mm A"),
          end: end.format("DD MMM YYYY, hh:mm A"),
          totalDays,
          totalPrice: b.totalPrice,
          vehicle: {
            _id: b.vehicle?._id,
            make: b.vehicle?.make,
            model: b.vehicle?.model,
            pricePerDay: b.vehicle?.pricePerDay,
            totalDays,
            images: b.vehicle?.images,
            location: b.vehicle?.location,
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl font-semibold pt-25">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 relative pt-25">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Pending <span className="text-yellow-700">Payments</span>
      </h2>

      {pending.length === 0 ? (
        <p className="text-center text-gray-600">
          No pending payments. You're all caught up! 🎉
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {pending.map((b) => (
            <div
              key={b._id}
              className="border p-4 rounded-xl shadow-lg bg-white"
            >
              <img
                src={b.vehicle?.images}
                alt={b.vehicle?.make}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-1">
                {b.vehicle?.make} {b.vehicle?.model}
              </h3>
              <p className="text-gray-600">
                From: {b.startDate?.split("T")[0]} at {b.startTime}
              </p>
              <p className="text-gray-600">
                To: {b.endDate?.split("T")[0]} at {b.endTime}
              </p>
              <p className="text-gray-800 font-semibold mt-2">
                ₹ {b.totalPrice} / Status:{" "}
                <span className="text-yellow-500 font-bold">{b.status}</span>
              </p>

              <button
                onClick={() => continuePayment(b)}
                className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition duration-200"
              >
                Continue Payment
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/Dashboard")}
          className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default PendingPayments;
