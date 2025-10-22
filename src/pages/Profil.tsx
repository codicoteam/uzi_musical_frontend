import { useState } from "react";
import {
  User,
  Menu,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Bell,
} from "lucide-react";
import Sidebar from "../components/sidebar";

const ProfileScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    bio: "Music enthusiast and vinyl collector. Love discovering new artists and genres.",
    joinDate: "2023-06-15",
    avatar: "",
  });

  // Temporary state for editing
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  // Theme classes
  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-linear-to-br from-slate-50 via-gray-50 to-slate-100",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-white/50",
    header: isDarkMode ? "bg-gray-800/80" : "bg-white/80",
    input: isDarkMode
      ? "bg-gray-700/50 border-gray-600 text-white"
      : "bg-white/50 border-slate-200 text-slate-800",
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  return (
    <div
      className={`flex h-screen ${themeClasses.bg} relative transition-colors duration-300`}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b ${themeClasses.border} px-4 sm:px-6 py-4 relative`}
        >
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden mr-4 p-2 rounded-xl ${
                  isDarkMode ? "bg-gray-700" : "bg-slate-100/50"
                } hover:bg-opacity-80 transition-all duration-200`}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className={themeClasses.textSecondary}>Home</span>
                  <span
                    className={isDarkMode ? "text-gray-600" : "text-slate-300"}
                  >
                    ›
                  </span>
                  <span className={`${themeClasses.text} font-medium`}>
                    Profile
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div
                className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}
              >
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${themeClasses.text}`}>
                    {fullName}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>
                    Admin
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <span className="text-white font-semibold text-sm">
                      {initials}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${themeClasses.textSecondary}`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Profile Header Card */}
       {/* Profile Header Card */}
          <div
            className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-3xl overflow-hidden shadow-lg`}
          >
            {/* Cover Image with Gradient Overlay */}
            <div className="h-40 sm:h-48 bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 relative">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            </div>

            {/* Profile Info */}
            <div className="px-4 sm:px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between -mt-16 sm:-mt-20 gap-4">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                  <div className="relative group">
                    <div className={`w-32 h-32 sm:w-36 sm:h-36 bg-linear-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'border-4 border-gray-800' : 'border-4 border-white'} relative overflow-hidden ring-4 ring-purple-500/20`}>
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-4xl sm:text-5xl">
                          {initials}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm">
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-white mx-auto mb-1" />
                          <span className="text-white text-xs font-medium">Change Photo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name and Bio - Desktop */}
                  {!isEditing && (
                    <div className="hidden sm:block sm:pb-2 flex-1 max-w-md">
                      <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                        {fullName}
                      </h1>
                      <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-3`}>
                        {profile.bio}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                        <span className={`text-sm ${themeClasses.textSecondary}`}>
                          Joined {new Date(profile.joinDate).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <div className="sm:pt-2 w-full sm:w-auto">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={handleCancel}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 ${
                          isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-slate-200 hover:bg-slate-300"
                        } ${themeClasses.text} rounded-xl font-semibold transition-all duration-200`}
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Bio - Mobile & Edit Mode */}
              <div className="mt-6 space-y-3">
                {!isEditing ? (
                  <div className="sm:hidden">
                    <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                      {fullName}
                    </h1>
                    <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-3`}>
                      {profile.bio}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        Joined {new Date(profile.joinDate).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editedProfile.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        placeholder="First Name"
                        className={`px-4 py-3 rounded-xl border-2 ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      />
                      <input
                        type="text"
                        value={editedProfile.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Last Name"
                        className={`px-4 py-3 rounded-xl border-2 ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      />
                    </div>
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Bio"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div
            className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-4 sm:p-6`}
          >
            <div className="flex items-center space-x-2 mb-4">
              <User className={`w-5 h-5 ${themeClasses.text}`} />
              <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>
                Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  }`}
                >
                  <Mail
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                    Email Address
                  </p>
                  {!isEditing ? (
                    <p className={`text-sm font-medium ${themeClasses.text}`}>
                      {profile.email}
                    </p>
                  ) : (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    />
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  }`}
                >
                  <Phone
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                    Phone Number
                  </p>
                  {!isEditing ? (
                    <p className={`text-sm font-medium ${themeClasses.text}`}>
                      {profile.phone}
                    </p>
                  ) : (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                    Location
                  </p>
                  {!isEditing ? (
                    <p className={`text-sm font-medium ${themeClasses.text}`}>
                      {profile.location}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Security */}
            <div
              className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Shield className={`w-5 h-5 ${themeClasses.text}`} />
                <h2 className={`text-lg font-bold ${themeClasses.text}`}>
                  Security
                </h2>
              </div>
              <div className="space-y-3">
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  } hover:bg-opacity-80 transition-all`}
                >
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    Change Password
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    Update your password
                  </p>
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  } hover:bg-opacity-80 transition-all`}
                >
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    Two-Factor Authentication
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    Add extra security
                  </p>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div
              className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Bell className={`w-5 h-5 ${themeClasses.text}`} />
                <h2 className={`text-lg font-bold ${themeClasses.text}`}>
                  Notifications
                </h2>
              </div>
              <div className="space-y-3">
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  } hover:bg-opacity-80 transition-all`}
                >
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    Email Notifications
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    Manage email preferences
                  </p>
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl ${
                    isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                  } hover:bg-opacity-80 transition-all`}
                >
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    Push Notifications
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    Control push alerts
                  </p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileScreen;