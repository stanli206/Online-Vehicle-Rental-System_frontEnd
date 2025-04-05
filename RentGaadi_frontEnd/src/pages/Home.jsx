import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
          "http://localhost:5000/api/vehicle/getAllVehicles"
        );
        setVehicles(response.data.data);

        //Fetch ratings for each vehicle
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
        `http://localhost:5000/api/review/${vehicleId}/average-rating`
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
            className="mt-6 bg-yellow-600 px-6 py-3 text-lg font-semibold rounded-lg"
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
            className="border px-4 py-2 rounded-lg w-full sm:w-2/3"
          />
          <button
            onClick={scrollToVehicles}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg mt-2 sm:mt-0"
          >
            Search
          </button>
        </div>
      </section>

      {/* Vehicle Listings */}
      <section className="container mx-auto p-6">
        <h2 className="text-4xl font-bold text-center mb-8">
          Featured Vehicles
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
                    <p className="text-gray-600">
                      {vehicle.year}
                      {/*- {vehicle.location} */}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{vehicle.pricePerDay}/day
                    </p>
                    {/* <p className="text-gray-600">
                      {vehicle.seats} seater | {vehicle.transmission} |{" "}
                      {vehicle.fuelType}
                    </p> */}
                    {/* <p className="text-gray-600 mt-2">{vehicle.description}</p> */}

                    {/* ⭐ Rating Section */}
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

                    <div className="flex justify-center">
                      <button
                        onClick={() => handleRentNow(vehicle)}
                        className="mt-4 w-full sm:w-52 bg-yellow-600 text-white py-2 rounded-md text-center"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600">No vehicles found</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
