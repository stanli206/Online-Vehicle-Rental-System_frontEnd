import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MyBooking = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  const fetchUserBookings = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/booking/booking&payment/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setBookings(res.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/review/createReview/${selectedVehicle._id}`,
        newReview,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setShowReviewModal(false);
      setNewReview({ rating: 0, comment: "" });
      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const openReviewModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowReviewModal(true);
  };

  const handleCancelRide = async (bookingId, vehicleId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    const action = booking?.status === "pending" ? "remove" : "cancel";

    const message =
      action === "remove"
        ? "Are you sure you want to remove this pending booking?"
        : `Are you sure you want to cancel this ride?${
            booking?.payment?.status === "completed"
              ? "\n\nNote: Your payment will be refunded within 5-7 business days."
              : ""
          }`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/booking/updateStatus/${bookingId}`,
        {
          status: action,
          vehicleId: vehicleId,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      let successMessage = `Booking ${
        action === "remove" ? "removed" : "cancelled"
      } successfully!`;

      if (action === "cancel" && booking?.payment?.status === "completed") {
        successMessage +=
          "\n\nYour refund will be processed within 5-7 business days.";
      }

      alert(successMessage);
      fetchUserBookings();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(error.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setNewReview({ rating: 0, comment: "" });
  };

  useEffect(() => {
    if (user && user._id) {
      fetchUserBookings();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl font-semibold">Loading...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 relative pt-25">
      <h2 className="text-3xl font-bold mb-6 text-center">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border p-4 rounded-xl shadow-lg bg-white"
            >
              <img
                src={booking.vehicle.images}
                alt={booking.vehicle?.make}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-1">
                {booking.vehicle?.make} {booking.vehicle?.model}
              </h3>
              <p className="text-gray-600">
                From: {booking.startDate?.split("T")[0]} at {booking.startTime}
              </p>
              <p className="text-gray-600">
                To: {booking.endDate?.split("T")[0]} at {booking.endTime}
              </p>
              <p className="text-gray-800 font-semibold mt-2">
                ₹ {booking.totalPrice} / Status:{" "}
                <span
                  className={`${
                    booking.status === "confirmed"
                      ? "text-green-600"
                      : booking.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  } font-bold`}
                >
                  {booking.status}
                </span>
              </p>

              {booking.payment && (
                <div className="mt-3 text-sm text-gray-600 break-words">
                  <p>Paid via: {booking.payment.paymentMethod}</p>
                  <p className="break-all">
                    Transaction ID: {booking.payment.transactionId}
                  </p>
                  <p>Payment Status: {booking.payment.status}</p>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => openReviewModal(booking.vehicle)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Rate This Vehicle
                  </button>
                )}
                {(booking.status === "confirmed" ||
                  booking.status === "pending") && (
                  <button
                    onClick={() =>
                      handleCancelRide(booking._id, booking.vehicle._id)
                    }
                    className={`px-4 py-2 ${
                      booking.status === "pending"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white rounded`}
                  >
                    {booking.status === "pending" ? "Remove" : "Cancel Ride"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-100 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">
              Rate {selectedVehicle?.make} {selectedVehicle?.model}
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full border rounded-md p-2"
                  rows="4"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
