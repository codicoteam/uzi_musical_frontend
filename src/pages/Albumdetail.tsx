import { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  ArrowLeft,
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
  Disc3,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import trackService from "../services/tracks_service";
import cover2 from "../assets/replacementcover/cover6.png";

interface Album {
  _id: string;
  artist:
    | {
        _id: string;
        name: string;
      }
    | string;
  title: string;
  release_date: string;
  genre:
    | {
        _id: string;
        name: string;
      }
    | string
    | null;
  cover_art: string | null;
  description: string;
  track_count: number;
  copyright_info: string | null;
  publisher: string | null;
  credits: string | null;
  affiliation: string | null;
  duration: number | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface Track {
  _id: string;
  album: string;
  title: string;
  durationMs: number;
  trackNumber: number | null;
  featuredArtists: string | null;
  trackArt: string | null;
  trackDescription: string | null;
  specialCredits: string | null;
  backingVocals: string | null;
  instrumentation: string | null;
  releaseDate: string | null;
  producer: string | null;
  masteringEngineer: string | null;
  mixingEngineer: string | null;
  writer: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const AlbumDetailScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const album = location.state?.album as Album;

  const userName = "John Doe";

  const [clickAnimations, setClickAnimations] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);

  const handleLikeWithAnimation = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle like state
    const isLiked = likedTracks.has(trackId);
    setLikedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });

    // Only show animation when liking (not unliking)
    if (!isLiked) {
      // Create animation at click position
      const rect = e.currentTarget.getBoundingClientRect();
      const animationId = `${trackId}-${Date.now()}`;

      setClickAnimations((prev) => [
        ...prev,
        {
          id: animationId,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      ]);

      // Remove animation after it completes
      setTimeout(() => {
        setClickAnimations((prev) =>
          prev.filter((anim) => anim.id !== animationId)
        );
      }, 1000);
    }
  };

  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-gradient-to-br from-red-50 via-red-100 to-red-200",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-red-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-red-700",
    border: isDarkMode ? "border-gray-700" : "border-white/50",
    header: isDarkMode ? "bg-gray-800/80" : "bg-white/80",
  };

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getArtistName = (): string => {
    if (typeof album?.artist === "object" && album.artist?.name) {
      return album.artist.name;
    }
    return "Unknown Artist";
  };

  const getGenreName = (): string => {
    if (typeof album?.genre === "object" && album.genre?.name) {
      return album.genre.name;
    }
    return "Unknown Genre";
  };

  const handleTrackClick = (track: Track) => {
    setSelectedTrack(track);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching tracks for album ID:", album._id);

        const response = await trackService.getTracksByAlbumId(album._id);

        console.log("✅ Tracks fetched successfully:", response);
        console.log("📊 Number of tracks:", response.tracks?.length);

        const tracksData = response.tracks || [];

        const sortedTracks = tracksData.sort((a: Track, b: Track) => {
          if (a.trackNumber && b.trackNumber) {
            return a.trackNumber - b.trackNumber;
          }
          return 0;
        });

        setTracks(sortedTracks);
        setError(null);
        console.log(
          "✨ Tracks state updated with",
          sortedTracks.length,
          "tracks"
        );
      } catch (err) {
        console.error("❌ Error fetching tracks:", err);
        console.error("❌ Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          albumId: album._id,
        });
        setError("Failed to load tracks");
        setTracks([]);
      } finally {
        setLoading(false);
        console.log("🏁 Fetch complete. Loading:", false);
      }
    };

    if (album) {
      fetchTracks();
    } else {
      console.warn("⚠️ No album data available");
    }
  }, [album]);

  if (!album) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${themeClasses.bg}`}
      >
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Album Not Found
          </h2>
          <button
            onClick={() => navigate("/albums")}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen ${themeClasses.bg} relative transition-colors duration-300 overflow-hidden`}
    >
      {/* Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Track Detail Modal */}
      <AnimatePresence>
        {selectedTrack && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedTrack(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] max-h-[90vh] z-50"
            >
              <div
                className={`${themeClasses.card} backdrop-blur-xl rounded-2xl shadow-2xl h-full flex flex-col`}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-red-200/50">
                  <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                    Track Details
                  </h2>
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className={`p-2 rounded-full hover:bg-red-100/50 transition-colors ${themeClasses.text}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain max-h-[calc(95vh-80px)] md:max-h-[calc(90vh-80px)]">
                  <div className="space-y-4 sm:space-y-6 pb-6">
                    {/* Track Hero */}
                    <div className="flex flex-col sm:flex-row gap-6">
                      {selectedTrack.trackArt && (
                        <img
                          src={selectedTrack.trackArt}
                          alt={selectedTrack.title}
                          className="w-full sm:w-48 h-48 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = cover2;
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider mb-2`}
                        >
                          Track {selectedTrack.trackNumber || "N/A"}
                        </p>
                        <h3
                          className={`text-3xl font-bold ${themeClasses.text} mb-2`}
                        >
                          {selectedTrack.title}
                        </h3>
                        <p className={`text-lg ${themeClasses.textSecondary}`}>
                          {selectedTrack.featuredArtists || getArtistName()}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <span
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {formatDuration(selectedTrack.durationMs)}
                          </span>
                          {selectedTrack.releaseDate && (
                            <>
                              <span className={themeClasses.textSecondary}>
                                •
                              </span>
                              <span
                                className={`text-sm ${themeClasses.textSecondary}`}
                              >
                                {formatDate(selectedTrack.releaseDate)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Track Description */}
                    {selectedTrack.trackDescription && (
                      <div
                        className={`p-4 rounded-lg bg-red-50/50 border ${themeClasses.border}`}
                      >
                        <h4
                          className={`text-sm font-semibold ${themeClasses.text} mb-2`}
                        >
                          About This Track
                        </h4>
                        <p
                          className={`text-sm ${themeClasses.textSecondary} leading-relaxed wrap-break-word overflow-wrap-anywhere`}
                        >
                          {selectedTrack.trackDescription}
                        </p>
                      </div>
                    )}

                    {/* Credits Section */}
                    <div>
                      <h4
                        className={`text-lg font-bold ${themeClasses.text} mb-4`}
                      >
                        Credits
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTrack.producer && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Producer
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.producer}
                            </p>
                          </div>
                        )}
                        {selectedTrack.writer && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Writer
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.writer}
                            </p>
                          </div>
                        )}
                        {selectedTrack.mixingEngineer && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Mixing Engineer
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.mixingEngineer}
                            </p>
                          </div>
                        )}
                        {selectedTrack.masteringEngineer && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Mastering Engineer
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.masteringEngineer}
                            </p>
                          </div>
                        )}
                        {selectedTrack.backingVocals && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Backing Vocals
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.backingVocals}
                            </p>
                          </div>
                        )}
                        {selectedTrack.instrumentation && (
                          <div
                            className={`p-3 rounded-lg bg-white/50 border ${themeClasses.border}`}
                          >
                            <p
                              className={`text-xs ${themeClasses.textSecondary} mb-1`}
                            >
                              Instrumentation
                            </p>
                            <p
                              className={`text-sm font-medium ${themeClasses.text}`}
                            >
                              {selectedTrack.instrumentation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Credits */}
                    {selectedTrack.specialCredits && (
                      <div
                        className={`p-4 rounded-lg bg-red-50/50 border ${themeClasses.border}`}
                      >
                        <h4
                          className={`text-sm font-semibold ${themeClasses.text} mb-2`}
                        >
                          Special Credits
                        </h4>
                        <p
                          className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
                        >
                          {selectedTrack.specialCredits}
                        </p>
                      </div>
                    )}

                    {/* Album Info */}
                    <div
                      className={`p-4 rounded-lg bg-white/50 border ${themeClasses.border}`}
                    >
                      <h4
                        className={`text-sm font-semibold ${themeClasses.text} mb-3`}
                      >
                        From the Album
                      </h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={album.cover_art || "/placeholder-album.png"}
                          alt={album.title}
                          className="w-16 h-16 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = cover2;
                          }}
                        />
                        <div>
                          <p className={`font-medium ${themeClasses.text}`}>
                            {album.title}
                          </p>
                          <p
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {getArtistName()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-[290px]">
        {/* Header */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b ${themeClasses.border} px-3 sm:px-6 py-3 fixed top-0 left-0 lg:left-[270px] right-0 z-30`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-red-100/50"
                } hover:bg-opacity-80 transition-all`}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>

              <button
                onClick={() => navigate("/albums")}
                className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-red-100/50"
                } hover:bg-opacity-80 transition-all`}
              >
                <ArrowLeft
                  className={`w-5 h-5 ${themeClasses.textSecondary}`}
                />
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className={themeClasses.textSecondary}>Home</span>
                <span className="text-red-300">›</span>
                <span className={themeClasses.textSecondary}>Albums</span>
                <span className="text-red-300">›</span>
                <span
                  className={`${themeClasses.text} font-medium truncate max-w-[150px]`}
                >
                  {album.title}
                </span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 sm:space-x-3 pl-3 border-l ${themeClasses.border}`}
              >
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${themeClasses.text}`}>
                    {userName}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>
                    Admin
                  </div>
                </div>

                <div className="relative">
                  <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-xs">
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 ${themeClasses.textSecondary} hidden sm:block`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Album Hero Section */}
        <div className="pt-[60px] flex-1 overflow-y-auto">
          <div
            className={`relative bg-linear-to-b from-red-500 via-red-400 to-transparent pt-12 pb-6 px-4 sm:px-6 lg:px-8`}
            style={{
              background: `linear-gradient(180deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 100%)`,
            }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-full sm:w-auto flex justify-center sm:block">
                  <img
                    src={album.cover_art || "/placeholder-album.png"}
                    alt={album.title}
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-lg shadow-2xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = cover2;
                    }}
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <p
                    className={`text-xs sm:text-sm font-semibold mb-2 ${themeClasses.text} uppercase tracking-wide`}
                  >
                    Album
                  </p>
                  <h1
                    className={`text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 ${themeClasses.text} leading-tight`}
                  >
                    {album.title}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${themeClasses.text}`}
                    >
                      {getArtistName()}
                    </span>
                    <span className={themeClasses.textSecondary}>•</span>
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {new Date(album.release_date).getFullYear()}
                    </span>
                    <span className={themeClasses.textSecondary}>•</span>
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {album.track_count}{" "}
                      {album.track_count === 1 ? "song" : "songs"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 ${themeClasses.border} hover:border-red-500 transition-all duration-200 hover:scale-105 flex items-center justify-center ${themeClasses.text}`}
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 ${themeClasses.border} hover:border-red-500 transition-all duration-200 hover:scale-105 flex items-center justify-center ${themeClasses.text}`}
              >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 ${themeClasses.border} hover:border-red-500 transition-all duration-200 hover:scale-105 flex items-center justify-center ml-auto ${themeClasses.text}`}
              >
                <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Track List */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto">
            <div
              className={`${themeClasses.card} backdrop-blur-sm rounded-xl overflow-hidden shadow-lg`}
            >
              {/* Header Row */}
              <div
                className={`px-4 py-3 border-b ${themeClasses.border} hidden sm:grid grid-cols-12 gap-4 text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}
              >
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-4 hidden lg:block">Album</div>
                <div className="col-span-1 flex justify-end items-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {loading && (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Disc3
                      className={`w-5 h-5 ${themeClasses.textSecondary} animate-spin`}
                    />
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      Loading tracks...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-8 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {!loading && !error && tracks.length === 0 && (
                <div className="p-8 text-center">
                  <p className={themeClasses.textSecondary}>
                    No tracks available for this album
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                tracks.map((track, index) => (
                  <div
                    key={track._id}
                    onClick={() => handleTrackClick(track)}
                    className={`group px-4 py-2.5 sm:py-3 grid grid-cols-12 gap-2 sm:gap-4 items-center hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors cursor-pointer`}
                  >
                    {/* Track Number */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        {track.trackNumber || index + 1}
                      </span>
                    </div>

                    {/* Track Info */}
                    <div className="col-span-8 sm:col-span-6 min-w-0">
                      <h3
                        className={`font-medium ${themeClasses.text} truncate text-sm sm:text-base`}
                      >
                        {track.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${themeClasses.textSecondary} truncate`}
                      >
                        {track.featuredArtists || getArtistName()}
                      </p>
                    </div>

                    {/* Album Name (Hidden on Mobile) */}
                    <div className="col-span-4 hidden lg:block">
                      <p
                        className={`text-sm ${themeClasses.textSecondary} truncate`}
                      >
                        {album.title}
                      </p>
                    </div>

                    {/* Duration & Like */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2 sm:gap-4">
                      <button
                        onClick={(e) => handleLikeWithAnimation(track._id, e)}
                        className="hidden group-hover:block relative"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            likedTracks.has(track._id)
                              ? "fill-red-500 text-red-500 scale-110"
                              : `${themeClasses.textSecondary} hover:text-red-500`
                          }`}
                        />
                        {clickAnimations
                          .filter((anim) => anim.id.startsWith(track._id))
                          .map((anim) => (
                            <motion.div
                              key={anim.id}
                              initial={{ scale: 0, opacity: 1, y: 0 }}
                              animate={{ scale: 2, opacity: 0, y: -30 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute pointer-events-none"
                              style={{ left: anim.x, top: anim.y }}
                            >
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </motion.div>
                          ))}
                      </button>
                      <span
                        className={`text-xs sm:text-sm ${themeClasses.textSecondary} tabular-nums`}
                      >
                        {formatDuration(track.durationMs)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Album Details Section */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
            <div
              className={`${themeClasses.card} backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-6`}
            >
              <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                About This Album
              </h2>

              {album.description && (
                <div>
                  <h3
                    className={`text-sm font-semibold ${themeClasses.text} mb-2`}
                  >
                    Description
                  </h3>
                  <p
                    className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
                  >
                    {album.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                    Release Date
                  </p>
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    {formatDate(album.release_date)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                    Genre
                  </p>
                  <p className={`text-sm font-medium ${themeClasses.text}`}>
                    {getGenreName()}
                  </p>
                </div>
                {album.publisher && (
                  <div>
                    <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                      Publisher
                    </p>
                    <p className={`text-sm font-medium ${themeClasses.text}`}>
                      {album.publisher}
                    </p>
                  </div>
                )}
                {album.copyright_info && (
                  <div>
                    <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>
                      Copyright
                    </p>
                    <p className={`text-sm font-medium ${themeClasses.text}`}>
                      {album.copyright_info}
                    </p>
                  </div>
                )}
              </div>

              {album.credits && (
                <div>
                  <h3
                    className={`text-sm font-semibold ${themeClasses.text} mb-2`}
                  >
                    Credits
                  </h3>
                  <p
                    className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
                  >
                    {album.credits}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailScreen;
