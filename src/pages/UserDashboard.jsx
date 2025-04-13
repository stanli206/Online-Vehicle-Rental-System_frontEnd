import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { jsPDF } from "jspdf";

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
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
      console.log("✅ Full API Response: ", response); // 👈 Entire Axios response
      console.log("✅ Response Data Only: ", response.data);
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

  // Fetch invoice details
  const fetchInvoiceDetails = async (paymentId) => {
    try {
      const response = await axios.get(
        `https://rentgaadi-backend.onrender.com/api/user/users&bookings&payments/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const selectedInvoice = response.data.data.find(
        (invoice) => invoice._id === paymentId
      );

      if (selectedInvoice) {
        setInvoiceData(selectedInvoice);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
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
  //download invoice
  const downloadInvoice = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Invoice Details", 14, 20);

    // User Information
    doc.setFontSize(12);
    doc.text(`User Name: ${invoiceData.user.name}`, 14, 30);
    doc.text(`Email: ${invoiceData.user.email}`, 14, 40);
    doc.text(`Phone: ${invoiceData.user.phone}`, 14, 50);

    // Booking Information
    doc.text(`Booking ID: ${invoiceData.booking._id}`, 14, 60);
    doc.text(`Status: ${invoiceData.booking.status}`, 14, 70);
    doc.text(
      `Start Date: ${new Date(
        invoiceData.booking.startDate
      ).toLocaleDateString()}`,
      14,
      80
    );
    doc.text(
      `End Date: ${new Date(invoiceData.booking.endDate).toLocaleDateString()}`,
      14,
      90
    );
    // Vehicle Information
    doc.text(
      `Vehicle: ${invoiceData.booking.vehicle.make} ${invoiceData.booking.vehicle.model}`,
      14,
      120
    );
    doc.text(`Year: ${invoiceData.booking.vehicle.year}`, 14, 130);
    doc.text(
      `Rent Per Hour: ${invoiceData.booking.vehicle.pricePerDay}`,
      14,
      140
    );
    // Payment Information
    doc.text(`Amount: ${invoiceData.amount}`, 14, 150);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 14, 160);
    doc.text(`Transaction ID: ${invoiceData.transactionId}`, 14, 170);
    doc.text(`Payment Status: ${invoiceData.status}`, 14, 180);
    doc.text(
      `Date: ${new Date(invoiceData.createdAt).toLocaleString()}`,
      14,
      190
    );

    // Save the document
    doc.save("invoice.pdf");
  };
  ///download invoice
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-25">
      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-yellow-500">{profile?.name || "User"}!</span>
          </h1>
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
                        <p className="flex items-center text-lg font-bold text-yellow-700 space-x-1">
                          <span className="flex items-center">
                            <FaIndianRupeeSign className="text-base mt-[1px]" />
                            {vehicle.pricePerDay}
                          </span>
                          <span className="text-sm font-normal ml-1">
                            per day
                          </span>
                        </p>
                        {/* <span className="text-lg font-bold text-yellow-700">
                          ₹{vehicle.pricePerDay}/day
                        </span> */}
                      </div>
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
                          <p className="font-semibold">
                            Amount : {item.amount}
                          </p>
                          <p className="text-sm text-gray-500">
                            Date : {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right font-mono">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            status : {item.status}
                          </span>
                          <p className="text-xs mt-1 text-gray-600">
                            payment Method : {item.paymentMethod}
                          </p>
                          <p className="text-xs mt-1 text-gray-600">
                            TransactionID : {item.transactionId}
                          </p>
                          <button
                            onClick={() => fetchInvoiceDetails(item._id)}
                            className="mt-2 flex items-center text-sm text-yellow-700 hover:text-yellow-800"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Invoice
                          </button>
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

      {showInvoiceModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          {/* fixed inset-0 backdrop-blur-md bg-opacity-100 flex items-center justify-center p-4 z-50 */}
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold text-gray-800">
              Invoice Details
            </h2>

            {/* User Information */}
            <div className="mt-4">
              <p className="font-semibold">
                User Name: {invoiceData.user.name}
              </p>
              <p className="mt-2">Email: {invoiceData.user.email}</p>
              <p className="mt-2">Phone: {invoiceData.user.phone}</p>
            </div>
            {/* Vehicle Information */}
            <div className="mt-4">
              <p className="font-semibold">
                Vehicle: {invoiceData.booking.vehicle.make}{" "}
                {invoiceData.booking.vehicle.model}
              </p>
              <p className="mt-2">Year: {invoiceData.booking.vehicle.year}</p>
              <p className="mt-2">
                Rent Per Day: {invoiceData.booking.vehicle.pricePerDay}
              </p>
            </div>
            {/* Booking Information */}
            <div className="mt-4">
              <p className="font-semibold">
                Booking ID: {invoiceData.booking._id}
              </p>
              <p className="mt-2">Status: {invoiceData.booking.status}</p>
              <p className="mt-2">
                Start Date:{" "}
                {new Date(invoiceData.booking.startDate).toLocaleDateString()}
              </p>
              <p className="mt-2">
                End Date:{" "}
                {new Date(invoiceData.booking.endDate).toLocaleDateString()}
              </p>
            </div>

            {/* Payment Information */}
            <div className="mt-4">
              <p className="font-semibold">
                Amount: <FaIndianRupeeSign className="inline" />{" "}
                {invoiceData.amount}
              </p>
              <p className="mt-2">
                Payment Method: {invoiceData.paymentMethod}
              </p>
              <p className="mt-2 break-words w-full">
                Transaction ID: {invoiceData.transactionId}
              </p>
              <p className="mt-2">Payment Status: {invoiceData.status}</p>
              <p className="mt-2">
                Date: {new Date(invoiceData.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={downloadInvoice}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Download Invoice
            </button>
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
