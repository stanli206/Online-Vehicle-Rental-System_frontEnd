import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaIndianRupeeSign } from "react-icons/fa6";


const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vehiclesSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          "https://rentgaadi-backend.onrender.com/api/vehicle/getAllVehicles"
        );
        setVehicles(response.data.data);

        //Fetch ratings for each vehicle //https://rentgaadi-backend.onrender.com
        response.data.data.forEach((vehicle) => {
          fetchRating(vehicle._id);
        });
      } catch (err) {
        console.error(err);
        setError("Error fetching vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Fetch Rating for a Vehicle
  const fetchRating = async (vehicleId) => {
    try {
      const response = await axios.get(
        `https://rentgaadi-backend.onrender.com/api/review/${vehicleId}/average-rating`
      );
      setRatings((prevRatings) => ({
        ...prevRatings,
        [vehicleId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching rating", error);
    }
  };

  const handleRentNow = (vehicle) => {
    navigate("/booking", { state: { vehicle } });
  };

  // 🔍 Search Logic
  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model} ${vehicle.location}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // 🔹 Function to Scroll to Vehicles Section
  const scrollToVehicles = () => {
    vehiclesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-[500px] flex items-center justify-center text-white text-center"
        style={{ backgroundImage: "url('/car-rental-bg.jpg')" }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded-lg">
          <h1 className="text-5xl font-bold">Find Your Perfect Ride</h1>
          <p className="mt-4 text-lg">
            Book top-quality vehicles at the best prices.
          </p>
          <button
            onClick={scrollToVehicles}
            className="mt-6 bg-yellow-700 px-6 py-3 text-lg font-semibold rounded-lg"
          >
            Explore Cars
          </button>
        </div>
      </section>

      {/* Search Section */}
      <section
        ref={vehiclesSectionRef}
        className="py-8 px-4 bg-white shadow-md"
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <input
            type="text"
            placeholder="Search for cars, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
          <button
            onClick={scrollToVehicles}
            className="bg-yellow-700 text-white px-6 py-2 rounded-lg mt-2 sm:mt-0 "
          >
            Search
          </button>
        </div>
      </section>

      {/* Vehicle Listings */}
      <section className="container mx-auto p-6">
        <h2 className="text-4xl font-bold text-center mb-8">
          Featured <span className="text-yellow-700">Vehicles</span>
        </h2>

        {loading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => {
                const ratingData = ratings[vehicle._id] || {
                  averageRating: 0,
                  totalReviews: 0,
                };

                return (
                  <div
                    key={vehicle._id}
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <img
                      src={vehicle.images || "/default-image.jpg"}
                      alt={vehicle.model}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h2 className="text-2xl font-semibold">{`${vehicle.make} ${vehicle.model}`}</h2>
                    <p className="text-gray-600">{vehicle.year}</p>
                    <div className="flex items-center text-gray-500">
                      <svg
                        className="h-4 w-4 text-gray-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {vehicle.location}
                    </div>
                    <p className="flex items-center text-lg font-bold text-gray-800 space-x-1">
                      <span className="flex items-center">
                        <FaIndianRupeeSign className="text-base mt-[1px]" />
                        {vehicle.pricePerDay}
                      </span>
                      <span className="text-sm font-normal ml-1">per day</span>
                    </p>
                    {/* <p className="text-lg font-bold text-gray-800">
                      ₹{vehicle.pricePerDay}/day
                    </p> */}

                    {vehicle.availability ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Currently not available
                      </span>
                    )}

                    {/* Rating Section */}
                    <div className="flex items-end mt-2">
                      <span className="text-gray-600 text-sm font-medium mr-2">
                        {ratingData.averageRating}/5
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(ratingData.averageRating)
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
                      <span className="ml-2 text-sm/5 text-gray-600">
                        ({ratingData.totalReviews} reviews)
                      </span>
                    </div>

                    {vehicle.availability && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleRentNow(vehicle)}
                          className="mt-4 border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
                        >
                          Rent Now
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600">No vehicles found</p>
            )}
          </div>
        )}
      </section>

      {/* footer */}
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Us */}
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-gray-400">
                We provide premium vehicle rental services with the best prices
                and customer service in the industry.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-yellow-500 transition"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-yellow-500 transition"
                  >
                    Vehicles
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-yellow-500 transition"
                  >
                    My Bookings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-yellow-500 transition"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  123 Street, City, Country
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +1 234 567 890
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@rentauto.com
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to get special offers and updates
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-900"
                />
                <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-r-md">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright and Social */}
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} RentAUTO. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-yellow-500">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
