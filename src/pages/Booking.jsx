import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../context/AuthContext";
import moment from "moment";
import { FaIndianRupeeSign } from "react-icons/fa6";

const Booking = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `https://rentgaadi-backend.onrender.com/api/review/getAllReviewById/${vehicle._id}`
        );
        window.scrollTo(0, 0);
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchReviews();
  }, [vehicle._id, user?.token]);

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `https://rentgaadi-backend.onrender.com/api/review/createReview/${vehicle._id}`,
        newReview,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setReviews([...reviews, response.data]);
      setNewReview({ rating: 0, comment: "" });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Booking form state
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);

  // Fetch booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await axios.get(
          `https://rentgaadi-backend.onrender.com/api/booking/booked-dates/${vehicle._id}`
        );
        setBookedDates(response.data.bookedDates.map((date) => new Date(date)));
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
  }, [vehicle._id]);

  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to proceed with booking");
      navigate("/login");
      return;
    }

    const bookingData = {
      user: user._id,
      vehicle: vehicle._id,
      startDate: moment(formData.startDate).format(),
      startTime: moment(formData.startTime).format("HH:mm"),
      endDate: moment(formData.endDate).format(),
      endTime: moment(formData.endTime).format("HH:mm"),
    };

    try {
      const response = await axios.post(
        "https://rentgaadi-backend.onrender.com/api/booking/createBooking",
        bookingData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.status === 201) {
        setBookingDetails(response.data.booking);
      } else {
        alert("Booking failed! Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message);
    }
  };

  // Navigation functions
  const handleProceedToPay = () => {
    if (!bookingDetails) return;
    navigate("/payment", {
      state: {
        booking: {
          ...bookingDetails,
          vehicle: {
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            pricePerDay: vehicle.pricePerDay,
            totalDays: vehicle.totalDays,
            images: vehicle.images,
            location: vehicle.location,
          },
        },
      },
    });
  };

  const handleClear = () => {
    setFormData({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
    });
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Back button */}
      <div className="flex justify-between mt-20">
        <button
          onClick={() => navigate(-1)}
          className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium mb-6 "
        >
          ← Back
        </button>

        {/* Main heading */}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Book Your <span className="text-yellow-700">Ride</span>
        </h2>
      </div>
      {/* Vehicle and booking form section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vehicle details card */}
        <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <img
              src={vehicle.images || "/default-image.jpg"}
              alt={vehicle.model}
              className="w-full h-64 object-cover rounded-md"
            />
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            {vehicle.make} {vehicle.model}
          </h3>

          <div className="space-y-2 mb-4">
            <p className="flex items-center text-lg font-bold text-gray-800 space-x-1">
              <span className="flex items-center">
                <FaIndianRupeeSign className="text-base mt-[1px]" />
                {vehicle.pricePerDay}
              </span>
              <span className="text-sm font-normal ml-1">per day</span>
            </p>

            <p className="text-gray-700">{vehicle.year} Model</p>
            <p className="text-gray-700">{vehicle.seats} seater</p>
            <p className="text-gray-700">
              {vehicle.transmission} • {vehicle.fuelType}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Location:</span> {vehicle.location}
            </p>
          </div>

          <p className="text-gray-700 border-t pt-3">{vehicle.description}</p>
        </div>

        {/* Booking form */}
        <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
          {!bookingDetails ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Select Rental Period
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) => handleDateChange(date, "startDate")}
                    className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholderText="Select start date"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    required
                    excludeDates={bookedDates}
                    onKeyDown={(e) => e.preventDefault()}
                    dayClassName={(date) =>
                      bookedDates.some(
                        (d) => d.toDateString() === date.toDateString()
                      )
                        ? "bg-red-500 text-white rounded-full"
                        : undefined
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Start Time</label>
                  <DatePicker
                    selected={formData.startTime}
                    onChange={(date) => handleDateChange(date, "startTime")}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholderText="Select start time"
                    required
                    // onKeyDown={(e) => e.preventDefault()}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => handleDateChange(date, "endDate")}
                    className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholderText="Select end date"
                    dateFormat="dd/MM/yyyy"
                    minDate={formData.startDate}
                    required
                    excludeDates={bookedDates}
                    onKeyDown={(e) => e.preventDefault()}
                    dayClassName={(date) =>
                      bookedDates.some(
                        (d) => d.toDateString() === date.toDateString()
                      )
                        ? "bg-red-500 text-white rounded-full"
                        : undefined
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">End Time</label>
                  <DatePicker
                    selected={formData.endTime}
                    onChange={(date) => handleDateChange(date, "endTime")}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholderText="Select end time"
                    required
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium flex-1"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="border border-black px-4 py-2 rounded hover:bg-gray-200 transition duration-200 font-medium flex-1"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-black px-4 py-2 rounded hover:bg-red-200 transition duration-200 font-medium flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <h3 className="text-xl font-bold">Booking Confirmed!</h3>
              </div>

              <div className="space-y-2 text-left">
                <p>
                  <span className="font-medium">User:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Vehicle:</span> {vehicle.make}{" "}
                  {vehicle.model}
                </p>
                <p>
                  <span className="font-medium">Total Days:</span>{" "}
                  {bookingDetails.totalDays}
                </p>
                <p className="flex items-center text-lg font-bold text-gray-800 space-x-1">
                  Total :
                  <span className="flex items-center">
                    <FaIndianRupeeSign className="text-base mt-[1px]" />
                    {bookingDetails.totalPrice}
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleProceedToPay}
                  className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium flex-1"
                >
                  Proceed to Pay
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="border border-black px-4 py-2 rounded hover:bg-gray-200 transition duration-200 font-medium flex-1"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
            Customer <span className="text-yellow-700">Reviews</span>
          </h3>

          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(calculateAverageRating())
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-medium mr-1">{calculateAverageRating()}</span>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>
        </div>

        {/* Review form toggle */}
        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium mb-6"
          >
            Write a Review
          </button>
        ) : (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-6 border border-gray-200 p-4 rounded-lg"
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
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
              <label className="block text-gray-700 mb-2 font-medium">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                rows="4"
                placeholder="Share your experience with this vehicle..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium flex-1"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-black px-4 py-2 rounded hover:bg-gray-200 transition duration-200 font-medium flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-200 pb-6 last:border-0"
              >
                <div className="flex items-start mb-2">
                  <div className="flex items-center mr-3">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        {i < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {review.user?.name || "Anonymous"}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 pl-1">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
