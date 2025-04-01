import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
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
      } catch (err) {
        console.error(err);
        setError("Error fetching vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleRentNow = (vehicle) => {
    navigate("/booking", { state: { vehicle } });
  };

  // 🔹 Function to Scroll to Vehicles Section
  const scrollToVehicles = () => {
    vehiclesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔍 Search Logic
  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model} ${vehicle.location}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
            className="mt-6 bg-blue-500 px-6 py-3 text-lg font-semibold rounded-lg"
          >
            Explore Cars
          </button>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 bg-white shadow-md">
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
            className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-2 sm:mt-0"
          >
            Search
          </button>
        </div>
      </section>

      {/* Vehicle Listings */}
      <section ref={vehiclesSectionRef} className="container mx-auto p-6">
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
              filteredVehicles.map((vehicle) => (
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
                    {vehicle.year} - {vehicle.location}
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    ₹{vehicle.pricePerDay}/day
                  </p>
                  <p className="text-gray-600">
                    {vehicle.seats} seater | {vehicle.transmission} |{" "}
                    {vehicle.fuelType}
                  </p>
                  <p className="text-gray-600 mt-2">{vehicle.description}</p>
                  <button
                    onClick={() => handleRentNow(vehicle)}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md"
                  >
                    Rent Now
                  </button>
                </div>
              ))
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
