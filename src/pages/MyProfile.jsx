import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Key,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { profileAPI } from "../services/api";
import NotificationSystem from "../components/NotificationSystem";

const MyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    full_name: "",
    role_name: "",
    email: "",
    phone: "",
    dashboard_url: "",
  });
  const [editData, setEditData] = useState(null);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (type, title, message = "", autoDismiss = true) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        autoDismiss,
        timestamp: new Date(),
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("=== MYPROFILE AUTHENTICATION CHECK ===");

    const authToken = localStorage.getItem("authToken");
    const token = localStorage.getItem("token");
    const actualToken = authToken || token;

    console.log("authToken:", authToken);
    console.log("token:", token);
    console.log("actualToken:", actualToken);

    if (!actualToken) {
      console.log("No authentication token found, redirecting to login");
      navigate("/login");
      return;
    }

    const userData = localStorage.getItem("userData");
    const user = localStorage.getItem("user");
    const actualUserData = userData || user;

    console.log("userData:", userData);
    console.log("user:", user);
    console.log("actualUserData:", actualUserData);

    if (!actualUserData) {
      console.log("No user data found, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(actualUserData);
      console.log("Loaded user data:", parsedUser);

      if (!parsedUser.user_id) {
        console.log("User data missing user_id, redirecting to login");
        navigate("/login");
        return;
      }

      setProfileData(parsedUser);
      setEditData(parsedUser);

      if (!parsedUser.phone || !parsedUser.role_name) {
        console.log("Incomplete profile data, fetching fresh data from API");
        fetchUserProfile(parsedUser.user_id);
      } else {
        console.log("Profile data is complete, using localStorage data");
      }
    } catch (error) {
      console.log("Failed to parse user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    try {
      console.log("Fetching fresh user profile for ID:", userId);

      const authToken = localStorage.getItem("authToken");
      const token = localStorage.getItem("token");
      const actualToken = authToken || token;

      if (!actualToken) {
        console.log("No token found, skipping API call");
        return;
      }

      const response = await profileAPI.getProfile(userId);
      console.log("Fresh profile data:", response);

      if (response.success && response.data) {
        const userData = response.data;
        setProfileData(userData);
        setEditData(userData);

        const currentStorageKey = localStorage.getItem("userData")
          ? "userData"
          : "user";
        localStorage.setItem(currentStorageKey, JSON.stringify(userData));
        console.log("Updated localStorage with fresh user data");
      }
    } catch (error) {
      console.error("Failed to fetch fresh profile data:", error);

      if (error.message && error.message.includes("Authentication required")) {
        console.log(
          "Authentication error detected, but not logging out to prevent loop"
        );
        return;
      }

      console.log("Using localStorage data due to API error");
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      console.log("=== SAVING PROFILE DATA ===");
      console.log("Profile Data:", profileData);
      console.log("Edit Data:", editData);

      const authToken = localStorage.getItem("authToken");
      const token = localStorage.getItem("token");
      const actualToken = authToken || token;

      if (!actualToken) {
        addNotification(
          "error",
          "Authentication Error",
          "No authentication token found. Redirecting to login."
        );
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (passwordFields.newPassword) {
        if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
          addNotification(
            "error",
            "Password Mismatch",
            "New passwords do not match."
          );
          return;
        }
        if (!passwordFields.currentPassword) {
          addNotification(
            "error",
            "Password Required",
            "Current password is required to change password."
          );
          return;
        }
      }

      const updatePayload = {
        username: editData.username,
        full_name: editData.full_name,
        email: editData.email,
        phone: editData.phone,
        current_password: passwordFields.currentPassword,
        new_password: passwordFields.newPassword,
      };

      console.log("Update Payload:", updatePayload);

      const response = await profileAPI.updateProfile(
        profileData.user_id,
        updatePayload
      );

      console.log("API Response:", response);

      if (response.success) {
        const updatedUser = {
          ...profileData,
          username: editData.username,
          full_name: editData.full_name,
          email: editData.email,
          phone: editData.phone,
        };

        const currentStorageKey = localStorage.getItem("userData")
          ? "userData"
          : "user";
        localStorage.setItem(currentStorageKey, JSON.stringify(updatedUser));

        setProfileData(updatedUser);
        setIsEditing(false);
        setPasswordFields({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        addNotification(
          "success",
          "Profile Updated",
          "Your profile has been updated successfully!"
        );
      } else {
        console.error("Profile update failed:", response.message);
        addNotification(
          "error",
          "Update Failed",
          `Failed to update profile: ${response.message}`
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        addNotification(
          "error",
          "Session Expired",
          "Your session has expired. Redirecting to login."
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        addNotification(
          "error",
          "Update Error",
          error.message || "An error occurred while updating the profile."
        );
      }
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setPasswordFields({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setIsEditing(false);
    addNotification("info", "Edit Cancelled", "Changes have been discarded.");
  };

  if (!profileData.user_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] flex items-center justify-center relative overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
        <NotificationSystem
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    );
  }

  const fieldInputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-base transition-all duration-300 bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative z-10 p-4 sm:p-6 lg:p-8 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="bg-gradient-to-r from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="absolute inset-0 opacity-20">
              <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1200 400"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,200 C300,250 600,150 900,200 C1050,225 1150,175 1200,200 L1200,400 L0,400 Z"
                  fill="currentColor"
                  className="text-white animate-pulse"
                />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    YOUR PROFILE
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center space-x-3 drop-shadow-lg">
                  <User size={32} />
                  <span>My Profile</span>
                </h1>
                <p className="text-cyan-100 text-base sm:text-lg mt-2 drop-shadow-md">
                  Manage your profile information and security settings
                </p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-2xl text-base sm:text-lg font-medium flex items-center space-x-2 hover:bg-white/30 transition-all duration-300 group shadow-lg"
                >
                  <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl text-base sm:text-lg font-medium flex items-center space-x-2 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-2xl text-base sm:text-lg font-medium flex items-center space-x-2 hover:bg-white/30 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Personal Information Card */}
            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 ${
                hoveredCard === "personal"
                  ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-blue-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("personal")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-500">Your basic details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className={fieldInputClasses}
                        required
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent border border-gray-200 rounded-xl text-gray-800 text-base">
                        {profileData.username || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.full_name}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        className={fieldInputClasses}
                        required
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent border border-gray-200 rounded-xl text-gray-800 text-base">
                        {profileData.full_name || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={fieldInputClasses}
                          required
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent border border-gray-200 rounded-xl text-gray-800 text-base">
                        {profileData.email || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Phone No.
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className={fieldInputClasses}
                        />
                        <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent border border-gray-200 rounded-xl text-gray-800 text-base">
                        {profileData.phone && profileData.phone !== "0"
                          ? profileData.phone
                          : "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Information Card */}
            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 ${
                hoveredCard === "official"
                  ? "transform scale-105 shadow-2xl shadow-emerald-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-emerald-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("official")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-emerald-600 transition-colors duration-300">
                      Official Information
                    </h3>
                    <p className="text-sm text-gray-500">System credentials</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Role
                    </label>
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50/50 to-transparent border border-emerald-200/50 rounded-xl text-gray-800 text-base font-medium">
                      {profileData.role_name ||
                        profileData.role ||
                        "Not provided"}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      This field cannot be modified
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Dashboard URL
                    </label>
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50/50 to-transparent border border-emerald-200/50 rounded-xl text-gray-800 text-base font-mono text-sm break-all">
                      {profileData.dashboard_url || "Not provided"}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      This field cannot be modified
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings Card */}
            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 ${
                hoveredCard === "security"
                  ? "transform scale-105 shadow-2xl shadow-purple-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-purple-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("security")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Key className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-purple-600 transition-colors duration-300">
                      Security Settings
                    </h3>
                    <p className="text-sm text-gray-500">Password management</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordFields.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className={fieldInputClasses}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                          >
                            {showPassword.current ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordFields.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                            className={fieldInputClasses}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                          >
                            {showPassword.new ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordFields.confirmNewPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmNewPassword",
                                e.target.value
                              )
                            }
                            className={fieldInputClasses}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-200/30 mt-6">
                        <div className="text-xs text-gray-600 space-y-2">
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                            Leave password fields empty to keep current password
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                            New password must match confirmation
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Key size={24} className="text-purple-500" />
                      </div>
                      <p className="text-gray-600">
                        Click "Edit Profile" to change your password
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MyProfile;
