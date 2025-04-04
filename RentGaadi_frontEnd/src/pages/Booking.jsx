import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../context/AuthContext";
import moment from "moment";

const Booking = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;

  /////////////////////////////////////////////////////////

  // Add these new state variables at the top of your component with other useState declarations
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Add this useEffect for fetching reviews along with your other useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/review/getAllReviewById/${vehicle._id}`
          // {
          //   headers: {
          //     Authorization: `Bearer ${user.token}`,
          //   },
          // }
        );
        window.scrollTo(0, 0);
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Optional: Show error to user
        alert("Failed to load reviews. Please try again later.");
      }
    };

    //if (user?.token) {
    fetchReviews();
    // } else {
    //  console.log("User not authenticated - can't fetch reviews");
    //}
  }, [vehicle._id, user?.token]);

  // Add these new functions for handling reviews
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/review/createReview/${vehicle._id}`,
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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  //////////////////////////////////////////////////////////

  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/booking/booked-dates/${vehicle._id}`
        );
        setBookedDates(response.data.bookedDates.map((date) => new Date(date)));
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
  }, [vehicle._id]);

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

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
    console.log(bookingData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/booking/createBooking",
        bookingData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      console.log(response);

      if (response.status === 201) {
        console.log(response.data.booking);
        setBookingDetails(response.data.booking);
      } else {
        alert("Booking failed! Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message);
    }
  };

  const handleProceedToPay = () => {
    if (!bookingDetails) {
      console.error("Booking details missing:", bookingDetails);
      return;
    }

    console.log("Passing to payment:", {
      booking: bookingDetails,
      vehicle: vehicle,
    });

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

  // ✅ Clear button function to reset input fields
  const handleClear = () => {
    setFormData({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
    });
  };

  // ✅ Cancel button function to redirect to home page
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Book Your Ride
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md p-6 rounded-md">
          <img
            src={vehicle.images || "/default-image.jpg"}
            alt={vehicle.model}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
          <h3 className="text-2xl font-semibold text-gray-800">{`${vehicle.make} ${vehicle.model}`}</h3>
          <p className="text-lg font-bold text-gray-800">
            ₹{vehicle.pricePerDay}/day
          </p>
          <p className="text-gray-700"> {vehicle.year} Model</p>
          <p className="text-gray-700">{vehicle.seats} seater</p>
          <p className="text-gray-700">
            {vehicle.transmission} transmission - {vehicle.fuelType} Engine
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">vehicle location :</span>{" "}
            {vehicle.location}
          </p>
          <p className="text-gray-700">description : {vehicle.description}</p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-md">
          {!bookingDetails ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
                placeholderText="Select start date"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                required
                excludeDates={bookedDates}
                highlightDates={bookedDates}
                onKeyDown={(e) => e.preventDefault()}
              />
              <DatePicker
                selected={formData.startTime}
                onChange={(date) => handleDateChange(date, "startTime")}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
                placeholderText="Select start time"
                required
              />
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
                placeholderText="Select end date"
                dateFormat="dd/MM/yyyy"
                minDate={formData.startDate}
                required
                excludeDates={bookedDates}
                highlightDates={bookedDates}
                onKeyDown={(e) => e.preventDefault()}
              />
              <DatePicker
                selected={formData.endTime}
                onChange={(date) => handleDateChange(date, "endTime")}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
                placeholderText="Select end time"
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="mt-2 bg-blue-500 text-white py-2 rounded-md w-full hover:bg-blue-600 transition"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 bg-gray-400 text-white py-2 rounded-md w-full hover:bg-gray-500 transition"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-2 bg-red-500 text-white py-2 rounded-md w-full hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">
                Booking Confirmed!
              </h3>
              <p>User: {user.name}</p>
              <p>
                Vehicle: {vehicle.make} {vehicle.model}
              </p>
              <p>Total Days: {bookingDetails.totalDays}</p>
              <p>Total Price: ₹{bookingDetails.totalPrice}</p>
              <button
                onClick={handleProceedToPay}
                className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
              >
                Proceed to Pay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* review */}

      <div className="bg-white shadow-md p-6 rounded-md mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            Customer Reviews
          </h3>
          <div className="flex items-center">
            <span className="text-xl font-bold mr-2">
              {calculateAverageRating()}/5
            </span>
            <div className="flex">
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
            <span className="ml-2 text-gray-600">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>

        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="mb-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Write a Review
          </button>
        ) : (
          <form onSubmit={handleReviewSubmit} className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex">
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
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        {i < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">
                    {review.user?.name || "Anonymous"}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>

      {/* review */}
    </div>
  );
};

export default Booking;
