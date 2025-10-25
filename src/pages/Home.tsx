import { useState, useEffect, useCallback } from "react";
import {
  Music,
  Users,
  Menu,
  ChevronDown,
  TrendingUp,
  Activity,
  Disc,
  Play,
  Star,
  Clock,
  Search,
  X,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import albumService from "../services/album_service";

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
      // Remove any delays and use immediate navigation
      navigate(`/view`, {
        state: { album },
        // Prevent any blocking behavior
        replace: false,
      });
    },
    [navigate]
  );

  // Even faster handler for button clicks
  const handleViewAlbum = useCallback(
    (album: Album, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Direct immediate navigation without any wrappers
      navigate(`/view`, {
        state: { album },
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

  const totalStreams = 2456789;

  const firstName = "John Doe";

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
  // Mock albums data with release dates - aligned with Album model

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
    {
      label: "Total Streams",
      value: totalStreams,
      unit: "",
      trend: "+22%",
      color: "from-red-500 to-red-600",
      bgColor: isDarkMode
        ? "bg-red-900/20"
        : "bg-gradient-to-br from-red-500/10 to-red-600/5",
      borderColor: isDarkMode ? "border-red-700/50" : "border-red-200/50",
      icon: Play,
    },
  ];
  // Animation effect for counters
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
  }, [albums]); // Changed dependency from individual values to albums array

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

            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div
                className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}
              >
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${themeClasses.text}`}>
                    {firstName}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>
                    Admin
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <span className="text-white font-semibold text-sm">
                      {firstName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Featured Album Banner */}
          {featuredAlbum && !isSearching && (
            <div className="relative rounded-2xl overflow-hidden">
              <div
                className={`bg-linear-to-r ${featuredAlbum.color} p-6 sm:p-8 text-white`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-xl flex items-center justify-center">
                      <Star className="w-8 h-8 sm:w-10 sm:h-10" fill="white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                          FEATURED ALBUM
                        </span>
                        <span className="text-sm opacity-90">Support Now!</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {featuredAlbum.title}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {typeof featuredAlbum.artist === "string"
                          ? featuredAlbum.artist
                          : featuredAlbum.artist?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Launch Countdown
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold"></div>
                    <button
                      onClick={(e) => handleViewAlbum(featuredAlbum, e)}
                      className="mt-3 px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm"
                    >
                      Support Album
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!isSearching && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${metric.bgColor} ${metric.borderColor} border backdrop-blur-sm hover:-translate-y-1`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${
                              isDarkMode ? "bg-white/10" : "bg-white/20"
                            } backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                isDarkMode ? "text-white" : "text-slate-700"
                              }`}
                            />
                          </div>
                          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 animate-pulse" />
                        </div>
                        <div
                          className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-linear-to-r ${metric.color} shadow-sm`}
                        >
                          <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{metric.trend}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-1">
                          <span
                            className={`text-xl sm:text-2xl font-bold ${
                              isDarkMode ? "text-white" : "text-slate-800"
                            } tabular-nums`}
                          >
                            {animatedValues[index].toLocaleString()}
                          </span>
                        </div>
                        <h3
                          className={`text-[10px] sm:text-xs font-medium ${
                            isDarkMode ? "text-gray-300" : "text-slate-600"
                          } leading-tight`}
                        >
                          {metric.label}
                        </h3>
                      </div>

                      <div className="mt-2 sm:mt-3 relative">
                        <div
                          className={`w-full h-1 ${
                            isDarkMode ? "bg-white/20" : "bg-white/30"
                          } rounded-full overflow-hidden`}
                        >
                          <div
                            className={`h-full bg-linear-to-r ${metric.color} rounded-full animate-progress-bar origin-left transform scale-x-0`}
                            style={{
                              animation: `progress-bar 1.5s ease-out ${
                                index * 0.2
                              }s forwards`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Albums Section */}
          {/* Albums Section */}
          <div>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}
                >
                  {isSearching ? "Search Results" : "Current Albums"}
                </h2>
                <p
                  className={`text-xs sm:text-sm ${themeClasses.textSecondary} mt-1`}
                >
                  {isSearching
                    ? `Found ${filteredAlbums.length} album${
                        filteredAlbums.length !== 1 ? "s" : ""
                      } for "${searchQuery}"`
                    : "Browse our latest music collection"}
                </p>
              </div>

              {isSearching && (
                <button
                  onClick={clearSearch}
                  className={`mt-2 sm:mt-0 px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.card} hover:shadow-md transition-all duration-200 text-sm flex items-center space-x-2`}
                >
                  <X className="w-4 h-4" />
                  <span>Clear Search</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {displayAlbums.map((album, index) => (
                      <div
                        key={album._id || index}
                        className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                        onClick={() => openAlbumPage(album)}
                      >
                        {/* Album Image */}
                        <div className="relative h-48 sm:h-56 overflow-hidden">
                          <img
                            src={album.cover_art}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div
                              className={`p-3 sm:p-4 rounded-full bg-linear-to-r ${album.color} shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                            </div>
                          </div>

                          {/* Genre Badge */}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-black/50 backdrop-blur-md`}
                            >
                              {typeof album.genre === "string"
                                ? album.genre
                                : album.genre?.name || "Unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Album Info */}
                        <div className="p-4 sm:p-5">
                          <h3
                            className={`text-base sm:text-lg font-bold ${themeClasses.text} mb-1 line-clamp-1`}
                          >
                            {album.title}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm ${themeClasses.textSecondary} mb-3 line-clamp-1`}
                          >
                            {typeof album.artist === "string"
                              ? album.artist
                              : album.artist?.name}
                          </p>

                          {/* Album Stats */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Music
                                className={`w-3 h-3 ${themeClasses.textSecondary}`}
                              />
                              <span className={themeClasses.textSecondary}>
                                {album.track_count} tracks
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock
                                className={`w-3 h-3 ${themeClasses.textSecondary}`}
                              />
                              <span className={themeClasses.textSecondary}>
                                {new Date(
                                  album.release_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => handleViewAlbum(album, e)}
                            className={`w-full mt-4 px-4 py-2.5 rounded-lg bg-linear-to-r ${album.color} text-white font-semibold text-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
                          >
                            View Album
                          </button>
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

      {/* Add keyframes for progress bar animation */}
      <style>{`
        @keyframes progress-bar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
