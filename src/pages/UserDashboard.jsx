import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserCircle, Star, ArrowRight, ArrowLeft } from "lucide-react";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profilePicture: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchUserPayments(user._id);
      fetchProfile(user._id);
      fetchUserReviews(user._id);
    }
    fetchVehicles();
  }, [user]);

  // Fetch payments
  const fetchUserPayments = async (userId) => {
    try {
      const response = await axios.get(
        `https://rentgaadi-backend.onrender.com/api/user/users&bookings&payments/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching user payments", error);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(
        "https://rentgaadi-backend.onrender.com/api/vehicle/getAllVehicles"
      );
      setVehicles(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile
  const fetchProfile = async (userId) => {
    try {
      const res = await axios.get(
        `https://rentgaadi-backend.onrender.com/api/user/userProfile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setProfile(res.data);
      setUpdatedProfile({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        profilePicture: res.data.profilePicture || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Fetch user reviews
  const fetchUserReviews = async (userId) => {
    try {
      const response = await axios.get(
        `https://rentgaadi-backend.onrender.com/api/review/getReviewById/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    setProfileLoading(true);
    try {
      await axios.put(
        `https://rentgaadi-backend.onrender.com/api/user/updateProfile/${user._id}`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      await fetchProfile(user._id);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Vehicle carousel navigation
  const nextVehicle = () => {
    setCurrentVehicleIndex(
      (prevIndex) => (prevIndex + 1) % Math.ceil(vehicles.length / 3)
    );
  };

  const prevVehicle = () => {
    setCurrentVehicleIndex(
      (prevIndex) =>
        (prevIndex - 1 + Math.ceil(vehicles.length / 3)) %
        Math.ceil(vehicles.length / 3)
    );
  };

  const visibleVehicles = vehicles.slice(
    currentVehicleIndex * 3,
    currentVehicleIndex * 3 + 3
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-25">
      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gray-400 rounded-xl p-6 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.name || "User"}!
          </h1>
          <p className="mt-2 opacity-90">
            Here's what's happening with your account
          </p>
        </div>

        {/* Profile and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
            <div className="bg-yellow-700 p-4 text-white">
              <h2 className="text-xl font-bold">My Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-4">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-yellow-100"
                  />
                ) : (
                  <UserCircle className="w-24 h-24 text-gray-400 mb-4" />
                )}
                {/* {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200 text-sm"
                  >
                    Edit Profile
                  </button>
                )} */}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      type="text"
                      placeholder="Name"
                      value={updatedProfile.name}
                      onChange={(e) =>
                        setUpdatedProfile({
                          ...updatedProfile,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100"
                      type="email"
                      value={updatedProfile.email}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      type="text"
                      placeholder="Phone"
                      value={updatedProfile.phone}
                      onChange={(e) =>
                        setUpdatedProfile({
                          ...updatedProfile,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                      onClick={() => setEditMode(false)}
                      disabled={profileLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                      onClick={handleUpdate}
                      disabled={profileLoading}
                    >
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium w-20">Name:</span>
                    <span>{profile?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Email:</span>
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Phone:</span>
                    <span>{profile?.phone || "Not provided"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center border-t-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">
                {payments.length}
              </div>
              <div className="text-gray-600 mt-2 text-center">
                Completed Payments
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center border-t-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">
                {reviews.length}
              </div>
              <div className="text-gray-600 mt-2 text-center">
                Submitted Reviews
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center border-t-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">
                {vehicles.length > 0 ? vehicles.length : "0"}
              </div>
              <div className="text-gray-600 mt-2 text-center">
                Available Vehicles
              </div>
            </div>
          </div>
        </div>

        {/* Featured Vehicles Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Featured Vehicles
            </h2>
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-yellow-700 hover:text-yellow-800 font-medium"
            >
              Browse All <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={vehicle.images || "/default-image.jpg"}
                        alt={vehicle.model}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{`${vehicle.make} ${vehicle.model}`}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{vehicle.year}</span>
                        <span className="text-lg font-bold text-yellow-700">
                          ₹{vehicle.pricePerDay}/day
                        </span>
                      </div>
                      {/* <button
                        onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                        className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                      >
                        View Details
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
              {vehicles.length > 3 && (
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={prevVehicle}
                    className="p-2 rounded-full bg-gray-200 hover:bg-yellow-500 text-gray-800 hover:text-white transition duration-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextVehicle}
                    className="p-2 rounded-full bg-gray-200 hover:bg-yellow-500 text-gray-800 hover:text-white transition duration-200"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">
                No vehicles available at the moment.
              </p>
            </div>
          )}
        </section>

        {/* Payments and Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Payments Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-yellow-700 p-4 text-white">
              <h2 className="text-xl font-bold">Payment History</h2>
            </div>
            <div className="p-4">
              {payments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600">No payment history found.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                  >
                    Book a Vehicle
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {payments.map((item) => (
                    <div
                      key={item._id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">₹{item.amount}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </span>
                          <p className="text-xs mt-1 text-gray-600">
                            {item.paymentMethod} • {item.transactionId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-yellow-700 p-4 text-white">
              <h2 className="text-xl font-bold">My Reviews</h2>
            </div>
            <div className="p-4">
              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600">No reviews submitted yet.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                  >
                    Leave a Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {review.vehicle?.model || "Unknown Vehicle"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-gray-700">{review.comment}</p>
                        </div>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 font-medium">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
