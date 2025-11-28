import { useState, useEffect } from "react";
import {
  Music,
  Menu,
  ChevronDown,
  Award,
  DollarSign,
  Calendar,
  Disc,
  Star,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import profileService from "../services/profile_service";
import PaymentsService from "../services/payment_service";

// Define the Plaque interface for UI
interface Plaque {
  id: string;
  _id?: string;
  albumId?: string;
  plaqueType: string;
  plaqueImage?: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  referenceNumber?: string;
  pollUrl?: string;
  reason?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  paid?: boolean;
  currency?: string;

  // Album data
  album?: {
    _id: string;
    title: string;
    cover_art?: string;
    artist?: string | any;
    genre?: string;
    track_count?: number;
    description?: string;
  };

  // Additional fields for display
  name?: string;
  artist?: string;
  genre?: string;
  tracks?: number;
  certification?: string;
  color?: string;
  purchaseDate?: string;
}

// Modal for plaque details
interface PlaqueModalProps {
  plaque: Plaque | null;
  isOpen: boolean;
  onClose: () => void;
  onPollStatus: (plaque: Plaque) => void;
  polling: boolean;
}

const PlaqueModal: React.FC<PlaqueModalProps> = ({
  plaque,
  isOpen,
  onClose,
  onPollStatus,
  polling
}) => {
  const [isDarkMode] = useState(false);

  if (!isOpen || !plaque) return null;

  const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-slate-200",
  };

  const getStatusIcon = (status?: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'paid' || s === 'success' || s === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (s === 'failed' || s === 'cancelled') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'paid' || s === 'success' || s === 'completed') {
      return "text-green-600 bg-green-50 border-green-200";
    }
    if (s === 'failed' || s === 'cancelled') {
      return "text-red-600 bg-red-50 border-red-200";
    }
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.bg} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border ${themeClasses.border}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b ${themeClasses.border}">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-purple-500" />
            <h2 className={`text-xl font-bold ${themeClasses.text}`}>
              Plaque Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors ${isDarkMode ? "hover:bg-white" : "hover:bg-slate-900"
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Plaque Header */}
            <div className="flex items-start space-x-4">
              {plaque.plaqueImage || plaque.album?.cover_art ? (
                <img
                  src={plaque.plaqueImage || plaque.album?.cover_art}
                  alt={plaque.name || plaque.plaqueType}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${themeClasses.text}`}>
                    {plaque.name || plaque.album?.title || plaque.plaqueType}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(plaque.status)}`}>
                    {plaque.status || 'PENDING'}
                  </span>
                </div>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                  {plaque.artist || (plaque.reason ? plaque.reason.split(' by ')[1] : 'Unknown Artist')}
                </p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {plaque.plaqueType}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                <h4 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Amount:</span>
                    <span className={`font-semibold ${themeClasses.text}`}>
                      ${plaque.amount?.toFixed(2)} {plaque.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Method:</span>
                    <span className={themeClasses.text}>
                      {plaque.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Reference:</span>
                    <span className={`font-mono text-xs ${themeClasses.text}`}>
                      {plaque.referenceNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                <h4 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
                  Status Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={themeClasses.textSecondary}>Status:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(plaque.status)}
                      <span className={themeClasses.text}>
                        {plaque.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Paid:</span>
                    <span className={themeClasses.text}>
                      {plaque.paid ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Created:</span>
                    <span className={themeClasses.text}>
                      {plaque.createdAt ? new Date(plaque.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
              <h4 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className={themeClasses.textSecondary}>Email:</span>
                  <p className={themeClasses.text}>{plaque.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <span className={themeClasses.textSecondary}>Phone:</span>
                  <p className={themeClasses.text}>{plaque.customerPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Album Information */}
            {plaque.album && (
              <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                <h4 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
                  Album Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Title:</span>
                    <span className={themeClasses.text}>{plaque.album.title}</span>
                  </div>
                  {plaque.album.track_count && (
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>Tracks:</span>
                      <span className={themeClasses.text}>{plaque.album.track_count}</span>
                    </div>
                  )}
                  {plaque.album.genre && (
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>Genre:</span>
                      <span className={themeClasses.text}>{plaque.album.genre}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            {plaque.reason && (
              <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                <h4 className={`text-sm font-semibold ${themeClasses.text} mb-3`}>
                  Purchase Reason
                </h4>
                <p className={themeClasses.text}>{plaque.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t ${themeClasses.border}">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.text} hover:bg-opacity-10 transition-colors ${isDarkMode ? "hover:bg-white" : "hover:bg-slate-900"
              }`}
          >
            Close
          </button>
          <div className="flex items-center space-x-3">
            {plaque.pollUrl && (
              <button
                onClick={() => onPollStatus(plaque)}
                disabled={polling}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
                <span>{polling ? 'Checking...' : 'Check Status'}</span>
              </button>
            )}
            {plaque.referenceNumber && (
              <button
                onClick={() => {
                  // You could implement a function to check status by reference number
                  onPollStatus(plaque);
                }}
                disabled={polling}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaquesScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plaques, setPlaques] = useState<Plaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaque, setSelectedPlaque] = useState<Plaque | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [polling, setPolling] = useState(false);

  // User state
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    userName: string;
    userId?: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Theme classes
  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-white/50",
    header: isDarkMode ? "bg-gray-800/80" : "bg-white/80",
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);

        // First try to get profile data from profile service
        try {
          const profileData = await profileService.getMyProfile();
          console.log("Profile data from service:", profileData);

          if (profileData && profileData.success && profileData.profile) {
            const { profile } = profileData;

            // Extract user information from profile data
            const userInfo = {
              firstName:
                profile.userName ||
                profile.firstName ||
                profile.userId?.userName ||
                "User",
              lastName: "",
              profilePicture: profile.profilePicture || "",
              role: profile.role || profile.userId?.role || "",
              userName: profile.userName || profile.userId?.userName || "user",
              userId: profile.userId?._id || profile.userId || "",
            };

            console.log("Extracted user info:", userInfo);
            setUserProfile(userInfo);
            setProfileLoading(false);
            return;
          }
        } catch (profileError) {
          console.error("Error fetching profile from service:", profileError);
        }

        // Fallback to localStorage login data
        const storedUser = localStorage.getItem("userLogin");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log("User data from localStorage:", userData);

          if (userData.user) {
            setUserProfile({
              firstName: userData.user.userName || "User",
              lastName: "",
              profilePicture: userData.user.profilePicture || "",
              role: userData.user.role || "",
              userName: userData.user.userName || "User",
              userId: userData.user._id || userData.user.id || "",
            });
            setProfileLoading(false);
            return;
          }
        }

        // Final fallback if both methods fail
        setUserProfile({
          firstName: "User",
          lastName: "",
          profilePicture: "",
          role: "",
          userName: "user",
          userId: "",
        });
      } catch (error) {
        console.error("Error in user profile setup:", error);
        setUserProfile({
          firstName: "User",
          lastName: "",
          profilePicture: "",
          role: "",
          userName: "user",
          userId: "",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Get user's initials for fallback avatar
  const getUserInitials = () => {
    if (!userProfile) return "U";
    const userNameChar = userProfile.userName?.charAt(0) || "";
    const firstNameChar = userProfile.firstName?.charAt(0) || "";
    return (userNameChar || firstNameChar).toUpperCase() || "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (!userProfile) return "User";
    return userProfile.userName || userProfile.firstName || "User";
  };

  // Format role for display
  const getDisplayRole = () => {
    if (!userProfile) return "";
    return userProfile.role
      ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
      : "";
  };

  // Check if profile picture is a valid Supabase URL
  const isValidProfilePicture = (url: string) => {
    return url && url.startsWith("https://") && url.includes("supabase");
  };

  const getPlaqueColor = (type: string) => {
    const t = type?.toLowerCase() || "";
    switch (t) {
      case "silver plaque":
      case "silver":
        return "from-gray-300 to-gray-400";
      case "gold plaque":
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "platinum plaque":
      case "platinum":
        return "from-gray-100 to-gray-300";
      case "diamond plaque":
      case "diamond":
        return "from-cyan-400 to-blue-500";
      case "thank you":
        return "from-emerald-500 to-emerald-700";
      case "wood plaque":
        return "from-amber-700 to-amber-900";
      case "crimson":
        return "from-red-700 to-red-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  // Helper: status badge styles
  const getStatusBadgeClasses = (status?: string) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-semibold border";
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "success" || s === "completed") {
      return `${base} bg-green-100 text-green-700 border-green-200`;
    }
    if (s === "failed" || s === "cancelled") {
      return `${base} bg-red-100 text-red-700 border-red-200`;
    }
    // default: pending / unknown
    return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
  };

  // Handle plaque click - show modal with details
  const handleViewDetails = (plaque: Plaque) => {
    setSelectedPlaque(plaque);
    setModalOpen(true);
  };

  // Handle polling for payment status
  const handlePollStatus = async (plaque: Plaque) => {
    try {
      setPolling(true);
      console.log("🔄 Polling status for plaque:", plaque.referenceNumber);

      let result;

      // Try polling by reference number if no pollUrl
      if (plaque.referenceNumber) {
        result = await PaymentsService.getStatus(plaque.referenceNumber);
      } else if (plaque.pollUrl) {
        // If there's a pollUrl, use it
        result = await PaymentsService.pollStatus();
      }

      console.log("📊 Poll result:", result);

      if (result && result.success) {
        // Update the plaque in the list with new status
        setPlaques(prev => prev.map(p =>
          p.id === plaque.id || p._id === plaque._id
            ? { ...p, ...result, status: result.paid ? 'COMPLETED' : p.status }
            : p
        ));

        // Update selected plaque if it's the same one
        if (selectedPlaque && (selectedPlaque.id === plaque.id || selectedPlaque._id === plaque._id)) {
          setSelectedPlaque(prev => prev ? { ...prev, ...result, status: result.paid ? 'COMPLETED' : prev.status } : null);
        }

        // Show success message
        if (result.paid) {
          console.log("✅ Payment completed!");
        }
      }
    } catch (error) {
      console.error("❌ Error polling status:", error);
    } finally {
      setPolling(false);
    }
  };

  // Fetch plaques from /api/payments/purchases
  useEffect(() => {
    const fetchPlaques = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching purchases from payments service...");

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No auth token found");
          setError("User not authenticated. Please log in.");
          setPlaques([]);
          return;
        }

        const response: any = await PaymentsService.getPurchases();
        console.log("📦 Raw Purchases API Response:", response);

        // Handle the response structure properly
        let purchases: any[] = [];

        if (Array.isArray(response)) {
          purchases = response;
        } else if (response?.data && Array.isArray(response.data)) {
          purchases = response.data;
        } else if (response?.success && Array.isArray(response.data)) {
          purchases = response.data;
        }

        console.log("🎵 Processed purchases array:", purchases);

        const mappedPlaques: Plaque[] = purchases.map((purchase: any) => {
          // Extract artist from reason string: e.g. '... by Jahprayzah'
          let artist: string | undefined = undefined;
          if (typeof purchase.reason === "string") {
            const parts = purchase.reason.split(" by ");
            if (parts.length > 1) {
              artist = parts[1].replace(/"$/g, "");
            }
          }

          return {
            id: purchase._id || purchase.id,
            _id: purchase._id,
            albumId: purchase.album?._id || "",
            plaqueType: purchase.plaqueType || "Plaque",
            plaqueImage: purchase.album?.cover_art || undefined,
            amount: purchase.amount ?? 0,
            paymentMethod: purchase.paymentMethod || "",
            paymentStatus: purchase.status || "",
            status: purchase.status || "PENDING",
            referenceNumber: purchase.referenceNumber,
            pollUrl: purchase.pollurl || purchase.pollUrl,
            reason: purchase.reason,
            customerEmail: purchase.customerEmail,
            customerPhone: purchase.customerPhone,
            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt,
            paid: purchase.paid || false,
            currency: purchase.currency || "USD",

            // Album data
            album: purchase.album,

            // Display fields
            name: purchase.album?.title || purchase.plaqueType,
            artist: artist,
            genre: purchase.album?.genre,
            tracks: purchase.album?.track_count,
            certification: purchase.plaqueType,
            color: getPlaqueColor(purchase.plaqueType),
            purchaseDate: purchase.createdAt,
          };
        });

        console.log("✅ Mapped plaques:", mappedPlaques);
        setPlaques(mappedPlaques);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching plaques:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        setError("Failed to fetch plaques. Please try again later.");
        setPlaques([]);
      } finally {
        setLoading(false);
        console.log("✅ Fetch complete");
      }
    };

    // Only fetch plaques once profile is loaded (for header)
    if (!profileLoading) {
      fetchPlaques();
    }
  }, [profileLoading]);

  const totalSpent = plaques?.reduce((sum, plaque) => sum + (plaque.amount || 0), 0) || 0;

  return (
    <div className={`flex h-screen ${themeClasses.bg} relative transition-colors duration-300`}>
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
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                className={`lg:hidden mr-4 p-2 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-slate-100/50"
                  } hover:bg-opacity-80 transition-all duration-200`}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className={themeClasses.textSecondary}>Home</span>
                  <span
                    className={
                      isDarkMode ? "text-gray-600" : "text-slate-300"
                    }
                  >
                    ›
                  </span>
                  <span className={`${themeClasses.text} font-medium`}>
                    Plaques
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div
                className={`flex items-center space-x-3 pl-4 border ${themeClasses.border}`}
              >
                {!profileLoading && userProfile ? (
                  <>
                    <div className="text-right hidden sm:block">
                      <div
                        className={`text-sm font-semibold ${themeClasses.text}`}
                      >
                        {getDisplayName()}
                      </div>
                      <div
                        className={`text-xs ${themeClasses.textSecondary}`}
                      >
                        {getDisplayRole()}
                      </div>
                    </div>
                    <div className="relative">
                      {isValidProfilePicture(userProfile.profilePicture) ? (
                        <img
                          src={userProfile.profilePicture}
                          alt={getDisplayName()}
                          className="w-10 h-10 rounded-xl object-cover shadow-lg"
                          onError={(e) => {
                            console.error(
                              "Failed to load profile picture:",
                              userProfile.profilePicture
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}

                      {/* Fallback avatar with initials */}
                      {!isValidProfilePicture(userProfile.profilePicture) && (
                        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                          <span className="text-white font-semibold text-sm">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}

                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />
                  </>
                ) : (
                  // Loading state for user profile
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <div
                        className={`text-sm font-semibold ${themeClasses.text} animate-pulse`}
                      >
                        Loading...
                      </div>
                      <div
                        className={`text-xs ${themeClasses.textSecondary} animate-pulse`}
                      >
                        User
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                    <ChevronDown
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${themeClasses.text} mb-2`}
              >
                My Plaque Collection
              </h1>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Your commemorative album plaques and achievements
              </p>
            </div>
            <div
              className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign
                  className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                />
                <div>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>
                    Total Invested
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}
                  >
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex justify-center items-center py-12">
              <div className={`text-center ${themeClasses.text}`}>
                <p className="text-lg font-semibold mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Plaques Grid */}
          {!loading && !error && plaques && plaques.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {plaques.map((plaque) => (
                <div
                  key={plaque._id || plaque.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewDetails(plaque)}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                >
                  {/* Plaque Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-linear-to-r ${getPlaqueColor(
                        plaque.plaqueType
                      )} shadow-lg`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{plaque.plaqueType}</span>
                    </div>
                  </div>

                  {/* Album Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    {plaque.plaqueImage || plaque.album?.cover_art ? (
                      <img
                        src={plaque.plaqueImage || plaque.album?.cover_art}
                        alt={plaque.name || plaque.plaqueType || "Album"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-linear-to-br ${getPlaqueColor(
                          plaque.plaqueType
                        )}`}
                      ></div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

                    {/* Certification Badge */}
                    {plaque.certification && (
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white">
                          {plaque.certification}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Plaque Details */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-bold ${themeClasses.text} mb-1 line-clamp-1`}
                        >
                          {plaque.name || "Album Title"}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}
                        >
                          {plaque.artist || "Artist / Reason"}
                        </p>
                      </div>

                      {/* Payment status badge */}
                      <div className="shrink-0">
                        <span className={getStatusBadgeClasses(plaque.status)}>
                          {plaque.status || "PENDING"}
                        </span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {plaque.genre && (
                        <div
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                            }`}
                        >
                          <Disc
                            className={`w-4 h-4 ${isDarkMode
                                ? "text-purple-400"
                                : "text-purple-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-[10px] ${themeClasses.textSecondary}`}
                            >
                              Genre
                            </p>
                            <p
                              className={`text-xs font-semibold ${themeClasses.text}`}
                            >
                              {plaque.genre}
                            </p>
                          </div>
                        </div>
                      )}

                      {plaque.tracks && (
                        <div
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-slate-100/50"
                            }`}
                        >
                          <Music
                            className={`w-4 h-4 ${isDarkMode ? "text-pink-400" : "text-pink-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-[10px] ${themeClasses.textSecondary}`}
                            >
                              Tracks
                            </p>
                            <p
                              className={`text-xs font-semibold ${themeClasses.text}`}
                            >
                              {plaque.tracks}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Purchase Info */}
                    <div
                      className={`flex items-center justify-between pt-3 border-t ${themeClasses.border}`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center space-x-1.5">
                          <Calendar
                            className={`w-3.5 h-3.5 ${themeClasses.textSecondary}`}
                          />
                          <span
                            className={`text-xs ${themeClasses.textSecondary}`}
                          >
                            {plaque.purchaseDate
                              ? new Date(
                                plaque.purchaseDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                              : "N/A"}
                          </span>
                        </div>
                        {plaque.paymentMethod && (
                          <span className="text-[10px] uppercase tracking-wide text-gray-400">
                            {plaque.paymentMethod}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-linear-to-r ${plaque.color || "from-red-700 to-red-500"
                          }`}
                      >
                        <DollarSign className="w-3.5 h-3.5 text-white" />
                        <span className="text-sm font-bold text-white">
                          {Number(plaque.amount ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && (!plaques || plaques.length === 0) && (
            <div
              className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-12 text-center`}
            >
              <Award
                className={`w-16 h-16 mx-auto mb-4 ${themeClasses.textSecondary}`}
              />
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                No Plaques Yet
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Start building your collection by purchasing album plaques
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Plaque Details Modal */}
      <PlaqueModal
        plaque={selectedPlaque}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPollStatus={handlePollStatus}
        polling={polling}
      />
    </div>
  );
};

export default PlaquesScreen;