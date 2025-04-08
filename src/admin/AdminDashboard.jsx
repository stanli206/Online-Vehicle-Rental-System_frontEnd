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
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");
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
      .get(
        "https://rentgaadi-backend.onrender.com/api/vehicle/getAllVehicles",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        setVehicles(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    axios
      .get("https://rentgaadi-backend.onrender.com/api/user/getAllProfile", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setUsers(res.data.data || []);
        setUserLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
        setUserLoading(false);
      });

    axios
      .get(
        "https://rentgaadi-backend.onrender.com/api/user/users&bookings&payments",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        setCompletedPayments(res.data.data || []);
        setPaymentsLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching payments:", err);
        setPaymentsLoading(false);
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
    }

    axios
      .post(
        "https://rentgaadi-backend.onrender.com/api/vehicle/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
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
      availability: vehicle.availability,
    });
    setActiveTab("vehicles");
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
    formData.append("availability", newVehicle.availability);
    if (newVehicle.images) {
      formData.append("images", newVehicle.images);
    }

    axios
      .put(
        `https://rentgaadi-backend.onrender.com/api/vehicle/update/${editId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
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
          availability: true,
          image: null,
        });
        alert("Vehicle Updated!");
      })
      .catch(() => alert("Failed to update vehicle"));
  };

  const handleDeleteVehicle = (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      axios
        .delete(
          `https://rentgaadi-backend.onrender.com/api/vehicle/delete/${id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        )
        .then(() => {
          const filteredVehicles = vehicles.filter((v) => v._id !== id);
          setVehicles(filteredVehicles);
          alert("Vehicle Deleted!");
        })
        .catch(() => alert("Failed to delete vehicle"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 mt-15">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage your rental system</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "vehicles"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Vehicles
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "users"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "payments"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Booking & Payments
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Vehicle Management
                </h2>
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
                      availability: true,
                      image: null,
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {editId ? "Cancel Edit" : "Add New Vehicle"}
                </button>
              </div>

              {/* Add/Edit Vehicle Form */}
              {(editId || !editId) && (
                <div
                  ref={editFormRef}
                  className="bg-gray-50 p-4 md:p-6 rounded-lg mb-8"
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {editId ? "Edit Vehicle" : "Add New Vehicle"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Make
                      </label>
                      <input
                        type="text"
                        placeholder="Toyota, Honda, etc."
                        value={newVehicle.make}
                        onChange={(e) =>
                          setNewVehicle({ ...newVehicle, make: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="Camry, Civic, etc."
                        value={newVehicle.model}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            model: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        placeholder="2020"
                        value={newVehicle.year}
                        onChange={(e) =>
                          setNewVehicle({ ...newVehicle, year: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Day ($)
                      </label>
                      <input
                        type="number"
                        placeholder="50"
                        value={newVehicle.pricePerDay}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            pricePerDay: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="City or Address"
                        value={newVehicle.location}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            location: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seats
                      </label>
                      <input
                        type="number"
                        placeholder="4"
                        value={newVehicle.seats}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            seats: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        value={newVehicle.fuelType}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            fuelType: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transmission
                      </label>
                      <select
                        value={newVehicle.transmission}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            transmission: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select transmission</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Vehicle description and features..."
                        value={newVehicle.description}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="availability"
                        checked={newVehicle.availability}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            availability: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="availability"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Available for rent
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Image
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          name="images"
                          onChange={(e) =>
                            setNewVehicle({
                              ...newVehicle,
                              images: e.target.files[0],
                            })
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    {editId ? (
                      <>
                        <button
                          onClick={handleUpdateVehicle}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleAddVehicle}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add Vehicle
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle List */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Vehicle Inventory
                </h3>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No vehicles
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new vehicle.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={vehicle.images || "/default-image.jpg"}
                            alt={vehicle.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {vehicle.year}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                vehicle.availability
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {vehicle.availability
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {vehicle.description}
                            </p>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 text-gray-500 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {vehicle.seats} seats
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 text-gray-500 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {vehicle.fuelType}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 text-gray-500 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                  fillRule="evenodd"
                                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {vehicle.transmission}
                            </div>
                            <div className="flex items-center">
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
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-600">
                              ${vehicle.pricePerDay}/day
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(vehicle)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                                title="Edit"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle._id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                                title="Delete"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-4 md:p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                User Management
              </h2>

              {userLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are currently no registered users.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={
                                    user.profilePicture ||
                                    "/default-profile.png"
                                  }
                                  alt={user.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Payment Records
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
                    Export
                  </button>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : completedPayments.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No payment records
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are currently no completed payments.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User & Vehicle
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Booking Dates
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Locations
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Payment Details
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedPayments.map((item, idx) => {
                        const vehicle = item.booking?.vehicle || {};
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={
                                      item.user?.profilePicture ||
                                      "/default-profile.png"
                                    }
                                    alt={item.user?.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.user?.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {vehicle.make} {vehicle.model}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.booking?.startDate !== "-" ? (
                                  <>
                                    {new Date(
                                      item.booking.startDate
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                      item.booking.endDate
                                    ).toLocaleDateString()}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${vehicle.pricePerDay || vehicle.rentPerHour}
                                /day
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">Pickup:</span>{" "}
                                {item.booking?.pickupLocation}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Drop:</span>{" "}
                                {item.booking?.dropLocation}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                ₹{item.amount}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.paymentMethod}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">
                                ID: {item.transactionId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {item.booking?.status || "Completed"}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(item.createdAt).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
