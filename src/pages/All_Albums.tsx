import { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  Music,
  Search,
  LayoutGrid,
  Rows3,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
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

const AllAlbumsScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/90",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    header: isDarkMode ? "bg-gray-900/95" : "bg-white/90",
    hover: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
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
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-[290px]">
        {/* HEADER */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-lg border-b ${themeClasses.border} px-4 sm:px-8 py-4 sm:py-5 fixed top-0 left-0 lg:left-[290px] right-0 z-30`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-purple-100 hover:bg-purple-200 transition-colors"
                >
                  <Menu className="w-5 h-5 text-purple-700" />
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-700 to-red-500 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className={`${themeClasses.text} font-bold text-lg`}>
                      All Albums
                    </span>
                    <p className={`text-xs ${themeClasses.textSecondary}`}>
                      Complete Collection
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile User Profile */}
              <div className="sm:hidden flex items-center space-x-3">
                {!profileLoading && userProfile ? (
                  <div className="relative">
                    {isValidProfilePicture(userProfile.profilePicture) ? (
                      <img
                        src={userProfile.profilePicture}
                        alt={getDisplayName()}
                        className="w-9 h-9 rounded-lg object-cover shadow-lg"
                        onError={(e) => {
                          console.error("Failed to load profile picture:", userProfile.profilePicture);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avatar with initials - shown if no valid profile picture */}
                    {!isValidProfilePicture(userProfile.profilePicture) && (
                      <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25">
                        <span className="text-white font-semibold text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                ) : (
                  // Loading state for user profile
                  <div className="w-9 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="flex-1 sm:flex-initial">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Desktop User Profile - Same as HomeScreen */}
              <div className="hidden sm:flex items-center space-x-3 pl-4 border-l">
                {!profileLoading && userProfile ? (
                  <>
                    <div className="text-right">
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
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </>
                ) : (
                  // Loading state for user profile
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${themeClasses.text} animate-pulse`}>
                        Loading...
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary} animate-pulse`}>
                        User
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto pt-[120px] sm:pt-[100px] pb-8 px-4 sm:px-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1
                  className={`text-3xl sm:text-4xl font-bold ${themeClasses.text} mb-2`}
                >
                  Browse All Albums
                </h1>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {filteredAlbums.length}{" "}
                  {filteredAlbums.length === 1 ? "album" : "albums"} available
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* View Toggle */}
                <div
                  className={`inline-flex rounded-xl border ${themeClasses.border} p-1 bg-white shadow-sm`}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-linear-to-br from-red-700 to-red-500 text-white shadow-md"
                        : `${themeClasses.text} ${themeClasses.hover}`
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-linear-to-br from-red-700 to-red-500 text-white shadow-md"
                        : `${themeClasses.text} ${themeClasses.hover}`
                    }`}
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.hover} transition-colors`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>
            </div>

            {/* Album Grid */}
            {!loading &&
              !error &&
              filteredAlbums.length > 0 &&
              viewMode === "grid" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                  {filteredAlbums.map((album, index) => (
                    <motion.div
                      key={album._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -8, scale: 1.03 }}
                      className={`${themeClasses.card} backdrop-blur-md cursor-pointer border ${themeClasses.border} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-red-500 to-red-500">
                        <img
                          src={album.cover_art || "/placeholder.jpg"}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = cover;
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Music className="w-5 h-5 text-red-800" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          className={`font-bold ${themeClasses.text} text-sm mb-1 line-clamp-1`}
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
                        <div className="mt-2 space-y-1">
                          {album.track_count > 0 && (
                            <p className="text-xs text-red-500 font-medium">
                              {album.track_count} tracks
                            </p>
                          )}
                          {album.expires_at && (
                            <p className="text-xs text-orange-600 font-semibold">
                              {getTimeRemaining(album.expires_at)}
                            </p>
                          )}
                        </div>
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
                <div className="space-y-3">
                  {filteredAlbums.map((album, index) => (
                    <motion.div
                      key={album._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`${themeClasses.card} backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ${themeClasses.hover} cursor-pointer transition-all duration-200 border ${themeClasses.border} shadow-md hover:shadow-xl group`}
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="relative">
                        <img
                          src={album.cover_art || "/placeholder.jpg"}
                          alt={album.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = cover;
                          }}
                        />
                        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold ${themeClasses.text} text-base sm:text-lg line-clamp-1 mb-1`}
                        >
                          {album.title}
                        </h3>
                        <p
                          className={`text-sm ${themeClasses.textSecondary} line-clamp-1`}
                        >
                          {typeof album.artist === "string"
                            ? album.artist
                            : typeof album.artist === "object" &&
                              album.artist?.name
                            ? album.artist.name
                            : "Unknown Artist"}
                        </p>
                        {album.genre && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            {album.genre}
                          </span>
                        )}
                        {album.expires_at && (
                          <p className="text-xs text-orange-600 font-semibold mt-2">
                            ⏱️ {getTimeRemaining(album.expires_at)}
                          </p>
                        )}
                      </div>
                      {album.track_count > 0 && (
                        <div className="hidden sm:flex flex-col items-end">
                          <p
                            className={`text-sm font-semibold ${themeClasses.text}`}
                          >
                            {album.track_count}
                          </p>
                          <p className="text-xs text-gray-500">tracks</p>
                        </div>
                      )}
                      <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                    </motion.div>
                  ))}
                </div>
              )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className={`${themeClasses.textSecondary} font-medium`}>
                  Loading albums...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center py-32">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAlbums.length === 0 && (
              <div className="text-center py-32">
                <div className="w-20 h-20 bg-linear-to-br from-red-100 to-pred100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-10 h-10 text-red-800" />
                </div>
                <p
                  className={`${themeClasses.text} font-semibold text-lg mb-2`}
                >
                  {searchQuery ? "No albums found" : "No albums available"}
                </p>
                <p className={`${themeClasses.textSecondary} text-sm`}>
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Start adding albums to your collection"}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllAlbumsScreen;