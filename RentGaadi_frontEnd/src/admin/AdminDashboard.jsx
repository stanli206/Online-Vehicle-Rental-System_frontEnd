import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const editFormRef = useRef(null);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: "",
    pricePerDay: "",
    location: "",
    description: "",
    seats: "",
    fuelType: "",
    transmission: "",
    availability: true,
    images: null,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicle/getAllVehicles", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setVehicles(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleAddVehicle = () => {
    const formData = new FormData();
    formData.append("make", newVehicle.make);
    formData.append("model", newVehicle.model);
    formData.append("year", newVehicle.year);
    formData.append("pricePerDay", newVehicle.pricePerDay);
    formData.append("location", newVehicle.location);
    formData.append("description", newVehicle.description);
    formData.append("seats", newVehicle.seats);
    formData.append("fuelType", newVehicle.fuelType);
    formData.append("transmission", newVehicle.transmission);
    formData.append("availability", newVehicle.availability);
    if (newVehicle.images) {
      formData.append("images", newVehicle.images);
      console.log("images" + newVehicle.images);
    }

    axios
      .post("http://localhost:5000/api/vehicle/create", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setVehicles([...vehicles, res.data.vehicle]);
        setNewVehicle({
          make: "",
          model: "",
          year: "",
          pricePerDay: "",
          location: "",
          description: "",
          seats: "",
          fuelType: "",
          transmission: "",
          availability: true,
          image: null,
        });
        alert("Vehicle Added Successfully!");
      })
      .catch(() => alert("Error adding vehicle!"));
  };

  const handleEdit = (vehicle) => {
    setEditId(vehicle._id);
    setNewVehicle({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      pricePerDay: vehicle.pricePerDay,
      location: vehicle.location,
      description: vehicle.description,
      seats: vehicle.seats,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      availability: vehicle.availability, // Populate availability for edit
    });
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleUpdateVehicle = () => {
    const formData = new FormData();

    formData.append("make", newVehicle.make);
    formData.append("model", newVehicle.model);
    formData.append("year", newVehicle.year);
    formData.append("pricePerDay", newVehicle.pricePerDay);
    formData.append("location", newVehicle.location);
    formData.append("description", newVehicle.description);
    formData.append("seats", newVehicle.seats);
    formData.append("fuelType", newVehicle.fuelType);
    formData.append("transmission", newVehicle.transmission);
    formData.append("availability", newVehicle.availability); // Add availability to formData
    if (newVehicle.images) {
      formData.append("images", newVehicle.images);
      // Add image if available
    }
//http://localhost:5000
    axios
      .put(`https://rentgaadi-backend.onrender.com/api/vehicle/update/${editId}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        const updatedVehicles = vehicles.map((v) =>
          v._id === editId ? res.data.data : v
        );
        setVehicles(updatedVehicles);
        setEditId(null);
        setNewVehicle({
          make: "",
          model: "",
          year: "",
          pricePerDay: "",
          location: "",
          description: "",
          seats: "",
          fuelType: "",
          transmission: "",
          availability: true, // Reset to true after update
          image: null,
        });
        alert("Vehicle Updated!");
      })
      .catch(() => alert("Failed to update vehicle"));
  };

  const handleDeleteVehicle = (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      axios
        .delete(`http://localhost:5000/api/vehicle/delete/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then(() => {
          const filteredVehicles = vehicles.filter((v) => v._id !== id);
          setVehicles(filteredVehicles);
          alert("Vehicle Deleted!");
        })
        .catch(() => alert("Failed to delete vehicle"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-25">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🚗 Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center">Loading vehicles...</p>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Add Vehicle Form */}
          <div
            ref={editFormRef}
            className="bg-white shadow-md rounded p-5 mb-10"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {editId ? "✏️ Edit Vehicle" : "➕ Add New Vehicle"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Make"
                value={newVehicle.make}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, make: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Model"
                value={newVehicle.model}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, model: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Year"
                value={newVehicle.year}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, year: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price per Day"
                value={newVehicle.pricePerDay}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    pricePerDay: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Location"
                value={newVehicle.location}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, location: e.target.value })
                }
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={newVehicle.description}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    description: e.target.value,
                  })
                }
                className="border p-2 rounded col-span-2"
              />
              <input
                type="number"
                placeholder="Seats"
                value={newVehicle.seats}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, seats: e.target.value })
                }
                className="border p-2 rounded"
              />
              <select
                value={newVehicle.fuelType}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, fuelType: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option>--select fuel type--</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
              <select
                value={newVehicle.transmission}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, transmission: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option>--select transmission--</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
              {/* Availability Checkbox */}
              <label className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  checked={newVehicle.availability}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      availability: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Available
              </label>
              <input
                type="file"
                name="images"
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, images: e.target.files[0] })
                }
                className="border p-2 rounded col-span-2"
              />
            </div>

            {editId ? (
              <div className="mt-4">
                <button
                  onClick={handleUpdateVehicle}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditId(null);
                    setNewVehicle({
                      make: "",
                      model: "",
                      year: "",
                      pricePerDay: "",
                      location: "",
                      description: "",
                      seats: "",
                      fuelType: "",
                      transmission: "",
                      availability: true, // Reset availability to true
                      image: null,
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddVehicle}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Vehicle
              </button>
            )}
          </div>

          {/* Vehicle List */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Vehicles
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white p-4 shadow rounded border"
              >
                <img
                  src={vehicle.images || "/default-image.jpg"}
                  alt={vehicle.model}
                  className="w-full h-78 object-none rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-yellow-600 font-bold">
                  Vehicle ID : {vehicle._id}
                </p>
                <p className="text-blue-600 font-bold">
                  ${vehicle.pricePerDay}/day
                </p>
                <p className="text-gray-700">{vehicle.description}</p>
                <p className="text-gray-700">Seats: {vehicle.seats}</p>
                <p className="text-gray-700">Fuel: {vehicle.fuelType}</p>
                <p className="text-gray-700">
                  Available: {vehicle.availability ? "Yes" : "No"}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
