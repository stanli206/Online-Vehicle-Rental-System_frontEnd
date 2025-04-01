import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../context/AuthContext";
import moment from "moment";

const Booking = () => {
  const { user } = useContext(AuthContext); // Get logged-in user data
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;

  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
  });

  //   console.log(formData);

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };


// Inside your handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert("Please login to proceed with booking");
    navigate("/login");
    return;
  }

  // Format dates using moment.js to ensure correct timezone
  const formattedStartDate = moment(formData.startDate).format("YYYY-MM-DD[T]HH:mm:ss.SSSZ");
  const formattedEndDate = moment(formData.endDate).format("YYYY-MM-DD[T]HH:mm:ss.SSSZ");
  const formattedStartTime = moment(formData.startTime).format("YYYY-MM-DD[T]HH:mm:ss.SSSZ");
  const formattedEndTime = moment(formData.endTime).format("YYYY-MM-DD[T]HH:mm:ss.SSSZ");

  try {
    const bookingData = {
      user: user._id, // Pass logged-in user ID
      vehicle: vehicle._id,
      startDate: formattedStartDate,
      startTime: formattedStartTime,
      endDate: formattedEndDate,
      endTime: formattedEndTime,
    };

    const response = await axios.post(
      "http://localhost:5000/api/booking/createBooking",
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`, // Send authorization token
        },
      }
    );

    if (response.status === 201) {
      alert("Booking confirmed!");
      navigate("/");
    } else {
      alert("Booking failed! Please try again.");
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    alert(error.response?.data?.message);
  }
};


  if (!vehicle) {
    return <p className="text-center text-red-500">No vehicle selected</p>;
  }

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
          <p className="text-gray-500">{vehicle.location}</p>
          <p className="text-lg font-bold text-gray-800">
            ₹{vehicle.pricePerDay}/day
          </p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-md">
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Book Now
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleDateChange(date, "startDate")}
              className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
              placeholderText="Select start date"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              required
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
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white py-2 rounded-md w-full hover:bg-blue-600 transition"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
