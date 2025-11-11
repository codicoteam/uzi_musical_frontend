import { useState, useEffect, useCallback } from "react";
import {
  Music,
  Users,
  Menu,
  ChevronDown,
  Disc,
  Search,
  X,
  Eye,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import albumService from "../services/album_service";
import profileService from "../services/profile_service";
import defaultcover from "../assets/replacementcover/cover1.jpg";
import cover from "../assets/replacementcover/cover6.png";

const HomeScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  const [, setTimeRemaining] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User state
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    userName: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  type Album = {
    _id?: string;
    title: string;
    artist:
      | {
          _id: string;
          name: string;
        }
      | string;
    genre:
      | {
          _id: string;
          name: string;
        }
      | string;
    cover_art: string;
    release_date: string;
    track_count: number;
    description?: string;
    is_featured?: boolean;
    copyright_info?: string;
    publisher?: string;
    credits?: string;
    affiliation?: string;
    duration?: number;
    is_published?: boolean;
    color: string;
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

  // Preload images for faster loading
  const preloadImages = useCallback((albums: Album[]) => {
    albums.forEach((album) => {
      const img = new Image();
      img.src = album.cover_art;
    });
  }, []);

  // FAST navigation - using useCallback and direct execution
  const openAlbumPage = useCallback(
    (album: Album) => {
      navigate(`/view`, {
        state: { album },
        replace: false,
      });
    },
    [navigate]
  );

  // Mock data - replace with actual API calls
  const totalAlbums = albums?.length || 0;
  const totalArtists =
    albums?.length > 0
      ? new Set(
          albums.map((album) =>
            typeof album.artist === "string" ? album.artist : album.artist?.name
          )
        ).size
      : 0;
  const totalTracks =
    albums?.reduce((sum, album) => sum + (album.track_count || 0), 0) || 0;

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
    input: isDarkMode
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
      : "bg-white/50 border-gray-200 text-slate-800 placeholder-gray-500",
  };

  // Calculate time remaining until release
  const calculateTimeRemaining = (release_date: string) => {
    const release = new Date(release_date).getTime();
    const now = new Date().getTime();
    const difference = release - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isReleased: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isReleased: false,
    };
  };

  // Fetch albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await albumService.getAllAlbums();

        // Handle different possible response structures
        let albumsData: Album[] = [];

        if (Array.isArray(response)) {
          albumsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          albumsData = response.data;
        } else if (response.albums && Array.isArray(response.albums)) {
          albumsData = response.albums;
        }

        setAlbums(albumsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch albums. Please try again later.");
        console.error("Error fetching albums:", err);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Search functionality
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setIsSearching(query.length > 0);

      if (query.trim() === "") {
        setFilteredAlbums([]);
        return;
      }

      const lowercasedQuery = query.toLowerCase().trim();
      const filtered = albums.filter((album) => {
        const artistName =
          typeof album.artist === "string"
            ? album.artist
            : album.artist?.name || "";
        const genreName =
          typeof album.genre === "string"
            ? album.genre
            : album.genre?.name || "";

        return (
          album.title.toLowerCase().includes(lowercasedQuery) ||
          artistName.toLowerCase().includes(lowercasedQuery) ||
          genreName.toLowerCase().includes(lowercasedQuery) ||
          (album.description &&
            album.description.toLowerCase().includes(lowercasedQuery))
        );
      });

      setFilteredAlbums(filtered);
    },
    [albums]
  );

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredAlbums([]);
    setIsSearching(false);
  };

  const featuredAlbum = albums.find((album) => album.is_featured);

  const metrics = [
    {
      label: "Total Albums",
      value: totalAlbums,
      unit: "",
      trend: "+12%",
      color: "from-red-500 to-red-600",
      bgColor: isDarkMode
        ? "bg-red-900/20"
        : "bg-gradient-to-br from-red-500/10 to-red-600/5",
      borderColor: isDarkMode ? "border-red-700/50" : "border-red-200/50",
      icon: Disc,
    },
    {
      label: "Total Artists",
      value: totalArtists,
      unit: "",
      trend: "+8%",
      color: "from-red-500 to-red-600",
      bgColor: isDarkMode
        ? "bg-red-900/20"
        : "bg-gradient-to-br from-red-500/10 to-red-600/5",
      borderColor: isDarkMode ? "border-red-700/50" : "border-red-200/50",
      icon: Users,
    },
    {
      label: "Total Tracks",
      value: totalTracks,
      unit: "",
      trend: "+15%",
      color: "from-red-500 to-red-600",
      bgColor: isDarkMode
        ? "bg-red-900/20"
        : "bg-gradient-to-br from-red-500/10 to-red-600/5",
      borderColor: isDarkMode ? "border-red-700/50" : "border-red-200/50",
      icon: Music,
    },
  ];

  // Animation effect for counters
  useEffect(() => {
    // Only animate if we have albums loaded
    if (albums.length === 0) return;

    const timer = setTimeout(() => {
      metrics.forEach((metric, index) => {
        const targetValue = metric.value;
        let currentValue = 0;
        const increment = targetValue / 50;

        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(counter);
          }

          setAnimatedValues((prev) => {
            const newValues = [...prev];
            newValues[index] = Math.floor(currentValue);
            return newValues;
          });
        }, 30);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [albums]);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeRemaining: { [key: string]: any } = {};
      albums.forEach((album) => {
        newTimeRemaining[album.title] = calculateTimeRemaining(
          album.release_date
        );
      });
      setTimeRemaining(newTimeRemaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [albums]);

  // Preload images on component mount
  useEffect(() => {
    preloadImages(albums);
  }, [preloadImages]);

  // Display albums based on search state
  const displayAlbums = isSearching ? filteredAlbums : albums;

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
                    Albums
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search albums, artists, genres..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${themeClasses.input} backdrop-blur-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200 text-sm`}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X
                      className={`w-4 h-4 ${themeClasses.textSecondary} hover:text-red-500 transition-colors`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* User Profile - Positioned on the far right */}
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}
              >
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
                    <ChevronDown
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Hero Section with Featured Album */}
          {featuredAlbum && !isSearching && (
            <div className="relative h-[400px] sm:h-[500px] rounded-2xl overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={featuredAlbum.cover_art}
                  alt={featuredAlbum.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultcover;
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/90"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-3">
                    {featuredAlbum.title}
                  </h1>
                  <p className="text-base sm:text-lg text-white/90 mb-4">
                    {typeof featuredAlbum.artist === "string"
                      ? featuredAlbum.artist
                      : featuredAlbum.artist?.name}
                  </p>

                  <div className="flex items-center space-x-4 mb-6"></div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-xl p-4 sm:p-5 transition-all duration-300 ${metric.bgColor} ${metric.borderColor} border-2 backdrop-blur-sm hover:scale-105 hover:shadow-xl hover:shadow-red-500/20`}
                  >
                    {/* Vinyl-inspired circles in background */}
                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-red-500/10 to-transparent rounded-full -mr-10 sm:-mr-12 -mt-10 sm:-mt-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-tr from-red-500/5 to-transparent rounded-full -ml-8 sm:-ml-10 -mb-8 sm:-mb-10"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 sm:p-2.5 rounded-lg bg-linear-to-br ${metric.color} shadow-lg`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex items-center space-x-0.5 sm:space-x-1">
                          <div className="w-0.5 sm:w-1 h-4 sm:h-5 bg-red-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-0.5 sm:w-1 h-3 bg-red-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-0.5 sm:w-1 h-5 sm:h-6 bg-red-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <div
                          className={`text-2xl sm:text-3xl font-bold bg-linear-to-r ${metric.color} bg-clip-text text-transparent`}
                        >
                          {animatedValues[index].toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`text-xs sm:text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-slate-600"
                            }`}
                          >
                            {metric.label}
                          </div>
                          <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            {metric.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Albums Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}
                >
                  {isSearching ? "Search Results" : "Albums"}
                </h2>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                  {isSearching
                    ? `${filteredAlbums.length} result${
                        filteredAlbums.length !== 1 ? "s" : ""
                      }`
                    : `${albums.length} albums available`}
                </p>
              </div>

              {isSearching && (
                <button
                  onClick={clearSearch}
                  className={`px-3 py-1.5 rounded-lg ${themeClasses.card} hover:opacity-80 transition-opacity text-sm flex items-center space-x-1`}
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex justify-center items-center py-12">
                <div className={`text-center ${themeClasses.text}`}>
                  <p className="text-lg font-semibold">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Content - only show if not loading and no error */}
            {!loading && !error && (
              <>
                {isSearching && filteredAlbums.length === 0 ? (
                  <div className="text-center py-12">
                    <Search
                      className={`w-16 h-16 mx-auto mb-4 ${themeClasses.textSecondary} opacity-50`}
                    />
                    <h3
                      className={`text-lg font-semibold ${themeClasses.text} mb-2`}
                    >
                      No albums found
                    </h3>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      No results found for "{searchQuery}". Try searching with
                      different terms.
                    </p>
                  </div>
                ) : albums.length === 0 ? (
                  <div className="text-center py-12">
                    <h3
                      className={`text-lg font-semibold ${themeClasses.text} mb-2`}
                    >
                      No albums available
                    </h3>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      Check back later for new music releases.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {displayAlbums.map((album, index) => (
                      <div
                        key={album._id || index}
                        className={`group relative overflow-hidden rounded-lg ${themeClasses.card} backdrop-blur-sm hover:bg-opacity-80 transition-all duration-200 cursor-pointer p-3`}
                        onClick={() => openAlbumPage(album)}
                      >
                        {/* Album Image */}
                        <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                          <img
                            src={album.cover_art}
                            alt={album.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = cover;
                            }}
                          />

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="p-3 rounded-full bg-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                              <Eye className="w-5 h-5 text-black" />
                            </div>
                          </div>
                        </div>

                        {/* Album Info */}
                        <div>
                          <h3
                            className={`text-sm font-semibold ${themeClasses.text} mb-1 line-clamp-1`}
                          >
                            {album.title}
                          </h3>
                          <p
                            className={`text-xs ${themeClasses.textSecondary} line-clamp-1`}
                          >
                            {typeof album.artist === "string"
                              ? album.artist
                              : album.artist?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeScreen;