import { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  ArrowLeft,
  Play,
  Heart,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../components/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import trackService from "../services/tracks_service";

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
  const navigate = useNavigate();
  const location = useLocation();
  const album = location.state?.album as Album;

  const userName = "John Doe";

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

  // Helper function to format duration from milliseconds to MM:SS
  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to get artist name
  const getArtistName = (): string => {
    if (typeof album?.artist === "object" && album.artist?.name) {
      return album.artist.name;
    }
    return "Unknown Artist";
  };

  // Helper function to get genre name
  const getGenreName = (): string => {
    if (typeof album?.genre === "object" && album.genre?.name) {
      return album.genre.name;
    }
    return "Unknown Genre";
  };

  // Fetch tracks using the track service
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching tracks for album ID:", album._id);

        // Fetch tracks by album ID instead of getting all tracks
        const response = await trackService.getTracksByAlbumId(album._id);

        console.log("✅ Tracks fetched successfully:", response);
        console.log("📊 Number of tracks:", response.tracks?.length);

        // Extract the tracks array from the response
        const tracksData = response.tracks || [];

        // Sort by track number
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

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-[290px]">
        {/* Header */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b ${themeClasses.border} px-4 sm:px-6 py-4 fixed top-0 left-0 lg:left-[270px] right-0 z-30`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden mr-4 p-2 rounded-xl ${
                  isDarkMode ? "bg-gray-700" : "bg-red-100/50"
                } hover:bg-opacity-80 transition-all duration-200`}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>

              <button
                onClick={() => navigate("/albums")}
                className={`mr-4 p-2 rounded-xl ${
                  isDarkMode ? "bg-gray-700" : "bg-red-100/50"
                } hover:bg-opacity-80 transition-all duration-200`}
              >
                <ArrowLeft
                  className={`w-5 h-5 ${themeClasses.textSecondary}`}
                />
              </button>

              <div className="flex items-center space-x-3">
                <span className={themeClasses.textSecondary}>Home</span>
                <span className="text-red-300">›</span>
                <span className={themeClasses.textSecondary}>Albums</span>
                <span className="text-red-300">›</span>
                <span className={`${themeClasses.text} font-medium`}>
                  {album.title}
                </span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}
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
                  <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <span className="text-white font-semibold text-sm">
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 ${themeClasses.textSecondary}`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Album Hero Section */}
        <div className="pt-[84px] flex-1 overflow-y-auto">
          <div
            className={`relative h-80 sm:h-96 bg-linear-to-r from-red-400 via-red-500 to-red-600 flex items-end`}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-full p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <img
                  src={album.cover_art || "/placeholder-album.png"}
                  alt={album.title}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl shadow-2xl object-cover"
                />
                <div className="flex-1 text-white">
                  <p className="text-sm font-medium mb-2">ALBUM</p>
                  <h1 className="text-4xl sm:text-6xl font-bold mb-4">
                    {album.title}
                  </h1>
                  <p className="text-lg sm:text-xl opacity-90 mb-4">
                    {getArtistName()}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{new Date(album.release_date).getFullYear()}</span>
                    <span>•</span>
                    <span>{album.track_count} tracks</span>
                    <span>•</span>
                    <span>{getGenreName()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex items-center gap-4">
              <button className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                <Play className="w-6 h-6" fill="currentColor" />
              </button>
              <button
                className={`p-3 rounded-full border ${themeClasses.border} hover:bg-opacity-80 transition-all duration-200`}
              >
                <Heart className={`w-6 h-6 ${themeClasses.text}`} />
              </button>
              <button
                className={`p-3 rounded-full border ${themeClasses.border} hover:bg-opacity-80 transition-all duration-200`}
              >
                <Share2 className={`w-6 h-6 ${themeClasses.text}`} />
              </button>
              <button
                className={`p-3 rounded-full border ${themeClasses.border} hover:bg-opacity-80 transition-all duration-200 ml-auto`}
              >
                <MoreHorizontal className={`w-6 h-6 ${themeClasses.text}`} />
              </button>
            </div>
          </div>

          {/* Track List */}
          <div className="px-6 sm:px-8 pb-8">
            <div
              className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl overflow-hidden`}
            >
              <div className={`p-6 border-b ${themeClasses.border}`}>
                <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
                  Track List
                </h2>
                {loading && (
                  <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
                    Loading tracks...
                  </p>
                )}
                {error && (
                  <p className={`text-sm text-red-500 mt-2`}>{error}</p>
                )}
              </div>
              <div className="divide-y divide-red-200 dark:divide-red-700">
                {tracks.length === 0 && !loading ? (
                  <div className="p-8 text-center">
                    <p className={themeClasses.textSecondary}>
                      No tracks available for this album
                    </p>
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div
                      key={track._id}
                      className="flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 text-center ${themeClasses.textSecondary}`}
                        >
                          {track.trackNumber || "-"}
                        </span>
                        <div>
                          <h3 className={`font-medium ${themeClasses.text}`}>
                            {track.title}
                          </h3>
                          <p
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            {track.featuredArtists || getArtistName()}
                          </p>
                        </div>
                      </div>
                      <span className={themeClasses.textSecondary}>
                        {formatDuration(track.durationMs)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Album Information */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Album Details */}
              <div
                className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6`}
              >
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
                  Album Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Title:</span>
                    <span className={themeClasses.text}>{album.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Artist:</span>
                    <span className={themeClasses.text}>{getArtistName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Genre:</span>
                    <span className={themeClasses.text}>{getGenreName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>
                      Release Date:
                    </span>
                    <span className={themeClasses.text}>
                      {new Date(album.release_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>
                      Total Tracks:
                    </span>
                    <span className={themeClasses.text}>
                      {album.track_count}
                    </span>
                  </div>
                  {album.publisher && (
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Publisher:
                      </span>
                      <span className={themeClasses.text}>
                        {album.publisher}
                      </span>
                    </div>
                  )}
                  {album.affiliation && (
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Affiliation:
                      </span>
                      <span className={themeClasses.text}>
                        {album.affiliation}
                      </span>
                    </div>
                  )}
                  {album.duration && (
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Duration:
                      </span>
                      <span className={themeClasses.text}>
                        {formatDuration(album.duration)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Status:</span>
                    <span
                      className={`${themeClasses.text} ${
                        album.is_published
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {album.is_published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Description & Credits */}
              <div
                className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl p-6`}
              >
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
                  About this Album
                </h3>
                <p className={`leading-relaxed ${themeClasses.text} mb-6`}>
                  {album.description || "No description available."}
                </p>

                {(album.credits ||
                  album.copyright_info ||
                  tracks.some(
                    (t) => t.producer || t.masteringEngineer || t.writer
                  )) && (
                  <div className="mt-6">
                    <h4 className={`font-bold ${themeClasses.text} mb-3`}>
                      Album Credits
                    </h4>
                    <div className="space-y-2 text-sm">
                      {album.credits && (
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>
                            Credits:
                          </span>
                          <span className={themeClasses.text}>
                            {album.credits}
                          </span>
                        </div>
                      )}
                      {tracks.length > 0 && tracks[0].producer && (
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>
                            Producer:
                          </span>
                          <span className={themeClasses.text}>
                            {tracks[0].producer}
                          </span>
                        </div>
                      )}
                      {tracks.length > 0 && tracks[0].masteringEngineer && (
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>
                            Mastered By:
                          </span>
                          <span className={themeClasses.text}>
                            {tracks[0].masteringEngineer}
                          </span>
                        </div>
                      )}
                      {tracks.length > 0 && tracks[0].writer && (
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>
                            Written By:
                          </span>
                          <span className={themeClasses.text}>
                            {tracks[0].writer}
                          </span>
                        </div>
                      )}
                      {album.copyright_info && (
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>
                            Copyright:
                          </span>
                          <span className={themeClasses.text}>
                            {album.copyright_info}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailScreen;
