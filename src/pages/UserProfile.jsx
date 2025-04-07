import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profilePicture: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/userProfile/${user._id}`,
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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/user/updateProfile/${user._id}`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      await fetchProfile();
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchProfile();
    }
  }, [user]);

  if (!profile)
    return (
      <div className="text-center mt-10 text-lg font-semibold">Loading...</div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      {/* Back to Home */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
        >
          ← Back to Home
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        My <span className="text-yellow-700">Profile</span>
      </h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <div className="flex flex-col items-center mb-6">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-300"
            />
          ) : (
            <UserCircle className="w-24 h-24 text-gray-400 mb-4" />
          )}
        </div>

        {editMode ? (
          <div className="space-y-4">
            <input
              className="border border-black p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
              type="text"
              placeholder="Name"
              value={updatedProfile.name}
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, name: e.target.value })
              }
            />
            <input
              className="border border-black p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
              type="email"
              placeholder="Email"
              value={updatedProfile.email}
              readOnly
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, email: e.target.value })
              }
            />
            <input
              className="border border-black p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
              type="text"
              placeholder="Phone"
              value={updatedProfile.phone}
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, phone: e.target.value })
              }
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">
              <label>Name: </label>
              {profile.name}
            </p>
            <p className="text-gray-600">
              <label>email : </label>
              {profile.email}
            </p>
            <p className="text-gray-600">
              <label>phone : </label>
              {profile.phone}
            </p>
            <button
              className="mt-6 border border-black px-4 py-2 rounded hover:bg-yellow-600 transition duration-200 font-medium"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
