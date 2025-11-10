import { useState, useEffect } from "react";
import { Menu, ChevronDown, Music, Search, Grid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import albumService from "../services/album_service";
import profileService from "../services/profile_service";
import cover from "../assets/replacementcover/cover6.png";

// ✅ Types
interface Album {
  _id: string;
  artist: string | { name: string };
  title: string;
  release_date: string;
  genre?: string;
  cover_art?: string;
  description?: string;
  track_count: number;
  is_published: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

interface ApiResponse {
  data?: Album[];
  albums?: Album[];
}

const AlbumScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"collection" | "stats">(
    "collection"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // User state - same as HomeScreen
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    userName: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  // Fetch user profile on component mount - same as HomeScreen
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
            
            // Extract user information from profile data - PRIORITIZE userName over firstName/lastName
            const userInfo = {
              firstName: profile.userName || profile.firstName || profile.userId?.userName || 'User',
              lastName: '', // Don't use lastName, we want to display only the userName
              profilePicture: profile.profilePicture || '',
              role: profile.role || profile.userId?.role || '',
              userName: profile.userName || profile.userId?.userName || 'user'
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
              firstName: userData.user.userName || 'User', // Use userName as firstName for display
              lastName: '',
              profilePicture: userData.user.profilePicture || '',
              role: userData.user.role || '',
              userName: userData.user.userName || 'User'
            });
            setProfileLoading(false);
            return;
          }
        }

        // Final fallback if both methods fail
        setUserProfile({
          firstName: 'User',
          lastName: '',
          profilePicture: '',
          role: '',
          userName: 'user'
        });
      } catch (error) {
        console.error("Error in user profile setup:", error);
        setUserProfile({
          firstName: 'User',
          lastName: '',
          profilePicture: '',
          role: '',
          userName: 'user'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Get user's initials for fallback avatar - use userName first
  const getUserInitials = () => {
    if (!userProfile) return "U";
    // Use userName first, then fallback to firstName
    const userNameChar = userProfile.userName?.charAt(0) || '';
    const firstNameChar = userProfile.firstName?.charAt(0) || '';
    return (userNameChar || firstNameChar).toUpperCase() || 'U';
  };

  // Get display name - PRIORITIZE userName over firstName/lastName
  const getDisplayName = () => {
    if (!userProfile) return "User";
    // Always return userName if available, otherwise fallback to firstName
    return userProfile.userName || userProfile.firstName || "User";
  };

  // Format role for display
  const getDisplayRole = () => {
    if (!userProfile) return "";
    return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
  };

  // Check if profile picture is a valid Supabase URL
  const isValidProfilePicture = (url: string) => {
    return url && url.startsWith('https://') && url.includes('supabase');
  };

  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/80",
    text: isDarkMode ? "text-white" : "text-slate-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-slate-200",
    header: isDarkMode ? "bg-gray-900/95" : "bg-white/95",
    hover: isDarkMode ? "hover:bg-gray-700" : "hover:bg-slate-50",
  };

  // ✅ Fetch albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response: ApiResponse | Album[] =
          await albumService.getAllAlbums();

        let albumsData: Album[] = [];

        if (Array.isArray(response)) {
          albumsData = response;
        } else if (Array.isArray(response.data)) {
          albumsData = response.data;
        } else if (Array.isArray(response.albums)) {
          albumsData = response.albums;
        } else {
          console.warn("Unexpected response:", response);
        }

        setAlbums(albumsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching albums:", err);
        setError("Failed to fetch albums. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleAlbumClick = (album: Album) => {
    navigate(`/details1`, { state: { album } });
  };

  const filteredAlbums = albums.filter((album) => {
    const title = album.title.toLowerCase();
    const artist =
      typeof album.artist === "string"
        ? album.artist.toLowerCase()
        : album.artist?.name?.toLowerCase() || "";
    return (
      title.includes(searchQuery.toLowerCase()) ||
      artist.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      className={`flex h-screen ${themeClasses.bg} relative transition-colors duration-300 overflow-hidden`}
    >
      {/* SIDEBAR */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-[290px] pl-6 sm:pl-8">
        {/* HEADER */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b ${themeClasses.border} px-4 sm:px-6 py-4 fixed top-0 left-0 lg:left-[270px] right-0 z-30`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-slate-100/50 hover:bg-opacity-80"
              >
                <Menu className="w-5 h-5" />
              </button>

              <span className={themeClasses.textSecondary}>Home</span>
              <span className="text-slate-400">›</span>
              <span className={`${themeClasses.text} font-medium`}>Albums</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 rounded-full bg-slate-100 border-0 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>

              {/* User Profile - Same as HomeScreen */}
              <div className="flex items-center space-x-3 pl-4 border-l">
                {!profileLoading && userProfile ? (
                  <>
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-semibold ${themeClasses.text}`}>
                        {getDisplayName()}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>
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
                            console.error("Failed to load profile picture:", userProfile.profilePicture);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback avatar with initials - shown if no valid profile picture */}
                      {!isValidProfilePicture(userProfile.profilePicture) && (
                        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                          <span className="text-white font-semibold text-sm">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <ChevronDown className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  </>
                ) : (
                  // Loading state for user profile
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-semibold ${themeClasses.text} animate-pulse`}>
                        Loading...
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary} animate-pulse`}>
                        User
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                    <ChevronDown className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto pt-[84px] pb-8 pr-4 sm:pr-6">
          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          <div className="flex space-x-4 pb-3 border-b sticky top-0 bg-opacity-80 backdrop-blur-md z-10">
            <button
              onClick={() => setActiveTab("collection")}
              className={`capitalize px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "collection"
                  ? "bg-red-600 text-white shadow-md"
                  : `${themeClasses.textSecondary} hover:bg-slate-100`
              }`}
            >
              Collection
            </button>
          </div>

          {/* COLLECTION TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "collection" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                  <div>
                    <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
                      My Album Collection
                    </h1>
                    <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                      {filteredAlbums.length}{" "}
                      {filteredAlbums.length === 1 ? "album" : "albums"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div
                      className={`flex rounded-lg border ${themeClasses.border} p-1 bg-white/50`}
                    >
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "grid"
                            ? "bg-red-600 text-white"
                            : `${themeClasses.text} ${themeClasses.hover}`
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "list"
                            ? "bg-red-600 text-white"
                            : `${themeClasses.text} ${themeClasses.hover}`
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Album Grid */}
                {!loading &&
                  !error &&
                  filteredAlbums.length > 0 &&
                  viewMode === "grid" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 mt-6">
                      {filteredAlbums.map((album, index) => (
                        <motion.div
                          key={album._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`${themeClasses.card} backdrop-blur-sm cursor-pointer border ${themeClasses.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group`}
                          onClick={() => handleAlbumClick(album)}
                        >
                          <div className="relative aspect-square overflow-hidden bg-slate-200">
                            <img
                              src={album.cover_art || "/placeholder.jpg"}
                              alt={album.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = cover;
                              }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-3">
                            <h3
                              className={`font-semibold ${themeClasses.text} text-sm line-clamp-1 mb-1`}
                            >
                              {album.title}
                            </h3>
                            <p
                              className={`text-xs ${themeClasses.textSecondary} line-clamp-1`}
                            >
                              {typeof album.artist === "string"
                                ? album.artist
                                : album.artist?.name ?? "Unknown Artist"}
                            </p>
                            {album.track_count > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                {album.track_count} tracks
                              </p>
                            )}
                            {album.expires_at && (
                              <p className="text-xs text-orange-600 font-semibold mt-1">
                                {getTimeRemaining(album.expires_at)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                {/* Album List */}
                {!loading &&
                  !error &&
                  filteredAlbums.length > 0 &&
                  viewMode === "list" && (
                    <div className="space-y-2 mt-6">
                      {filteredAlbums.map((album, index) => (
                        <motion.div
                          key={album._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`${themeClasses.card} backdrop-blur-sm rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 ${themeClasses.hover} cursor-pointer transition-all duration-200 border ${themeClasses.border}`}
                          onClick={() => handleAlbumClick(album)}
                        >
                          <img
                            src={album.cover_art || "/placeholder.jpg"}
                            alt={album.title}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = cover;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold ${themeClasses.text} text-sm sm:text-base line-clamp-1`}
                            >
                              {album.title}
                            </h3>
                            <p
                              className={`text-xs sm:text-sm ${themeClasses.textSecondary} line-clamp-1`}
                            >
                              {typeof album.artist === "string"
                                ? album.artist
                                : album.artist?.name ?? "Unknown Artist"}
                            </p>
                            {album.expires_at && (
                              <p className="text-xs text-orange-600 font-semibold mt-1">
                                ⏱️ {getTimeRemaining(album.expires_at)}
                              </p>
                            )}
                          </div>
                          {album.track_count > 0 && (
                            <div className="hidden sm:block text-xs text-slate-500">
                              {album.track_count} tracks
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
                    <p className={themeClasses.textSecondary}>
                      Loading albums...
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredAlbums.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className={`${themeClasses.textSecondary} font-medium`}>
                      {searchQuery
                        ? "No albums found"
                        : "No albums in your library"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AlbumScreen;