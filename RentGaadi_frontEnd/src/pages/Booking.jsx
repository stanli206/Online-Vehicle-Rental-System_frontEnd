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
          <p className="text-gray-500">{vehicle.location}</p>
          <p className="text-lg font-bold text-gray-800">
            ₹{vehicle.pricePerDay}/day
          </p>
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
    </div>
  );
};

export default Booking;

// import React, { useState, useEffect, useContext } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { AuthContext } from "../context/AuthContext";
// import moment from "moment";

// const Booking = () => {
//   const { user } = useContext(AuthContext);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const vehicle = location.state?.vehicle;

//   const [formData, setFormData] = useState({
//     startDate: null,
//     endDate: null,
//     startTime: null,
//     endTime: null,
//   });
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [bookedDates, setBookedDates] = useState([]);

//   useEffect(() => {
//     const fetchBookedDates = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:5000/api/booking/booked-dates/${vehicle._id}`
//         );
//         setBookedDates(response.data.bookedDates.map((date) => new Date(date)));
//       } catch (error) {
//         console.error("Error fetching booked dates:", error);
//       }
//     };

//     fetchBookedDates();
//   }, [vehicle._id]);

//   const handleDateChange = (date, field) => {
//     setFormData({ ...formData, [field]: date });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       alert("Please login to proceed with booking");
//       navigate("/login");
//       return;
//     }

//     const bookingData = {
//       user: user._id,
//       vehicle: vehicle._id,
//       startDate: moment(formData.startDate).format(),
//       startTime: moment(formData.startTime).format("HH:mm"),
//       endDate: moment(formData.endDate).format(),
//       endTime: moment(formData.endTime).format("HH:mm"),
//     };
//     console.log(bookingData);

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/booking/createBooking",
//         bookingData,
//         {
//           headers: { Authorization: `Bearer ${user.token}` },
//         }
//       );

//       if (response.status === 201) {
//         console.log(response.data.booking);

//         setBookingDetails(response.data.booking);
//       } else {
//         alert("Booking failed! Please try again.");
//       }
//     } catch (error) {
//       console.error("Error creating booking:", error);
//       alert(error.response?.data?.message);
//     }
//   };

//   const handleProceedToPay = () => {
//     if (!bookingDetails) {
//       console.error("Booking details missing:", bookingDetails);
//       setError("Booking information incomplete");
//       return;
//     }

//     console.log("Passing to payment:", {
//       booking: bookingDetails,
//       vehicle: vehicle,
//     });

//     navigate("/payment", {
//       state: {
//         booking: {
//           ...bookingDetails,
//           vehicle: {
//             _id: vehicle._id,
//             make: vehicle.make,
//             model: vehicle.model,
//             pricePerDay: vehicle.pricePerDay,
//             images: vehicle.images,
//             location: vehicle.location,
//           },
//         },
//       },
//     });
//   };

//   return (
//     <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
//         Book Your Ride
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white shadow-md p-6 rounded-md">
//           <img
//             src={vehicle.images || "/default-image.jpg"}
//             alt={vehicle.model}
//             className="w-full h-64 object-cover rounded-md mb-4"
//           />
//           <h3 className="text-2xl font-semibold text-gray-800">{`${vehicle.make} ${vehicle.model}`}</h3>
//           <p className="text-gray-500">{vehicle.location}</p>
//           <p className="text-lg font-bold text-gray-800">
//             ₹{vehicle.pricePerDay}/day
//           </p>
//         </div>
//         <div className="bg-white shadow-md p-6 rounded-md">
//           {!bookingDetails ? (
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//               <DatePicker
//                 selected={formData.startDate}
//                 onChange={(date) => handleDateChange(date, "startDate")}
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select start date"
//                 dateFormat="dd/MM/yyyy"
//                 minDate={new Date()}
//                 required
//                 excludeDates={bookedDates}
//                 highlightDates={bookedDates}
//                 onKeyDown={(e) => e.preventDefault()}
//               />
//               <DatePicker
//                 selected={formData.startTime}
//                 onChange={(date) => handleDateChange(date, "startTime")}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select start time"
//                 required
//               />
//               <DatePicker
//                 selected={formData.endDate}
//                 onChange={(date) => handleDateChange(date, "endDate")}
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select end date"
//                 dateFormat="dd/MM/yyyy"
//                 minDate={formData.startDate}
//                 required
//                 excludeDates={bookedDates}
//                 highlightDates={bookedDates}
//                 readOnly
//                 onKeyDown={(e) => e.preventDefault()}
//               />
//               <DatePicker
//                 selected={formData.endTime}
//                 onChange={(date) => handleDateChange(date, "endTime")}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select end time"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="mt-2 bg-blue-500 text-white py-2 rounded-md w-full hover:bg-blue-600 transition"
//               >
//                 Confirm Booking
//               </button>
//             </form>
//           ) : (
//             <div className="text-center">
//               <h3 className="text-xl font-bold text-gray-800">
//                 Booking Confirmed!
//               </h3>
//               <p>User: {user.name}</p>
//               <p>
//                 Vehicle: {vehicle.make} {vehicle.model}
//               </p>
//               <p>Total Price: ₹{bookingDetails.totalPrice}</p>
//               <button
//                 onClick={handleProceedToPay}
//                 className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
//               >
//                 Proceed to Pay
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Booking;

// import React, { useState, useEffect, useContext } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { AuthContext } from "../context/AuthContext";
// import moment from "moment";

// const Booking = () => {
//   const { user } = useContext(AuthContext);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const vehicle = location.state?.vehicle;

//   const [formData, setFormData] = useState({
//     startDate: null,
//     endDate: null,
//     startTime: null,
//     endTime: null,
//   });
//   const [bookingDetails, setBookingDetails] = useState(null);

//   const handleDateChange = (date, field) => {
//     setFormData({ ...formData, [field]: date });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       alert("Please login to proceed with booking");
//       navigate("/login");
//       return;
//     }

//     const bookingData = {
//       user: user._id,
//       vehicle: vehicle._id,
//       startDate: moment(formData.startDate).format(),
//       startTime: moment(formData.startTime).format("HH:mm"),
//       endDate: moment(formData.endDate).format(),
//       endTime: moment(formData.endTime).format("HH:mm"),
//     };
// console.log(bookingData);

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/booking/createBooking",
//         bookingData,
//         {
//           headers: { Authorization: `Bearer ${user.token}` },
//         }
//       );

//       if (response.status === 201) {
//         console.log(response.data.booking);

//         setBookingDetails(response.data.booking);
//       } else {
//         alert("Booking failed! Please try again.");
//       }
//     } catch (error) {
//       console.error("Error creating booking:", error);
//       alert(error.response?.data?.message);
//     }
//   };

//   const handleProceedToPay = () => {
//     if (!bookingDetails) {
//       console.error("Booking details missing:", bookingDetails);
//       setError("Booking information incomplete");
//       return;
//     }

//     console.log("Passing to payment:", {
//       booking: bookingDetails,
//       vehicle: vehicle,
//     });

//     navigate("/payment", {
//       state: {
//         booking: {
//           ...bookingDetails,
//           vehicle: {
//             // Include ALL required vehicle fields
//             _id: vehicle._id,
//             make: vehicle.make,
//             model: vehicle.model,
//             pricePerDay: vehicle.pricePerDay,
//             images: vehicle.images,
//             location: vehicle.location,
//           },
//         },
//       },
//     });
//   };

//   return (
//     <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
//         Book Your Ride
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white shadow-md p-6 rounded-md">
//           <img
//             src={vehicle.images || "/default-image.jpg"}
//             alt={vehicle.model}
//             className="w-full h-64 object-cover rounded-md mb-4"
//           />
//           <h3 className="text-2xl font-semibold text-gray-800">{`${vehicle.make} ${vehicle.model}`}</h3>
//           <p className="text-gray-500">{vehicle.location}</p>
//           <p className="text-lg font-bold text-gray-800">
//             ₹{vehicle.pricePerDay}/day
//           </p>
//         </div>
//         <div className="bg-white shadow-md p-6 rounded-md">
//           {!bookingDetails ? (
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//               <DatePicker
//                 selected={formData.startDate}
//                 onChange={(date) => handleDateChange(date, "startDate")}
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select start date"
//                 dateFormat="dd/MM/yyyy"
//                 minDate={new Date()}
//                 required
//               />
//               <DatePicker
//                 selected={formData.startTime}
//                 onChange={(date) => handleDateChange(date, "startTime")}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select start time"
//                 required
//               />
//               <DatePicker
//                 selected={formData.endDate}
//                 onChange={(date) => handleDateChange(date, "endDate")}
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select end date"
//                 dateFormat="dd/MM/yyyy"
//                 minDate={formData.startDate}
//                 required
//               />
//               <DatePicker
//                 selected={formData.endTime}
//                 onChange={(date) => handleDateChange(date, "endTime")}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className="border px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-full"
//                 placeholderText="Select end time"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="mt-2 bg-blue-500 text-white py-2 rounded-md w-full hover:bg-blue-600 transition"
//               >
//                 Confirm Booking
//               </button>
//             </form>
//           ) : (
//             <div className="text-center">
//               <h3 className="text-xl font-bold text-gray-800">
//                 Booking Confirmed!
//               </h3>
//               <p>User: {user.name}</p>
//               <p>
//                 Vehicle: {vehicle.make} {vehicle.model}
//               </p>
//               <p>Total Price: ₹{bookingDetails.totalPrice}</p>
//               <button
//                 onClick={handleProceedToPay}
//                 className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
//               >
//                 Proceed to Pay
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Booking;
