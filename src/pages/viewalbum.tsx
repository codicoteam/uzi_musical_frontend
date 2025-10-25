import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PaymentModal from "../components/home/payment";
import trackService from "../services/tracks_service";

interface Track {
  _id?: string;
  album: string;
  title: string;
  durationMs: number;
  trackNumber?: number;
  featuredArtists?: string;
  trackArt?: string;
  trackDescription?: string;
  specialCredits?: string;
  backingVocals?: string;
  instrumentation?: string;
  releaseDate?: string;
  producer?: string;
  masteringEngineer?: string;
  mixingEngineer?: string;
  writer?: string;
  isPublished?: boolean;
  isDeleted?: boolean;
}

interface Album {
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
  color?: string;
  tracks?: Track[];
}

const AlbumPage = () => {
  const navigate = useNavigate();
  useParams();
  const location = useLocation();
  const [isDarkMode] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(456);

  // Track state
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Get album data from navigation state or fallback
  const album = location.state?.album as Album | undefined;

  // Fetch tracks for the album
  useEffect(() => {
    const fetchTracks = async () => {
      if (!album?._id) return;

      try {
        setLoadingTracks(true);
        const response = await trackService.getTracksByAlbumId(album._id);
        console.log("Tracks response:", response); // Debug log
        const tracksData = response.data || response || [];
        console.log("Tracks data:", tracksData); // Debug log
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchTracks();
  }, [album]);

  const currentTrackData = tracks[currentTrack];

  // Safety check for album data
  useEffect(() => {
    if (!album && !location.state) {
      navigate("/", { replace: true });
    }
  }, [album, location.state, navigate]);

  const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-slate-200",
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNextTrack = () => {
    console.log(
      "Next clicked. Current:",
      currentTrack,
      "Total tracks:",
      tracks.length
    );
    if (tracks.length > 0 && currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1);
      console.log("Moving to track:", currentTrack + 1);
    } else {
      console.log("Cannot move to next track");
    }
  };

  const handlePrevTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  // Helper functions to safely access nested properties
  const getArtistName = () => {
    if (!album) return "Unknown Artist";
    return typeof album.artist === "string"
      ? album.artist
      : album.artist?.name || "Unknown Artist";
  };

  const getGenreName = () => {
    if (!album) return "Unknown";
    return typeof album.genre === "string"
      ? album.genre
      : album.genre?.name || "Unknown";
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return "0 Mins 0 Sec";
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} Hr ${minutes} Mins ${seconds} Sec`;
    }
    return `${minutes} Mins ${seconds} Sec`;
  };

  const formatAlbumDuration = (duration?: number) => {
    if (!duration) return "0 Hrs 0 Mins 0 Sec";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours} Hr ${minutes} Mins ${seconds} Sec`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  if (!album) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}
      >
        <div className="text-center">
          <p className={themeClasses.text}>Album not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}
    >
      {/* Header */}
      <header className={`border-b ${themeClasses.border} p-4 sm:p-6`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-slate-100 hover:bg-slate-200"
            } transition-colors duration-200`}
          >
            <ArrowLeft className={`w-5 h-5 ${themeClasses.text}`} />
          </button>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}
            >
              {album.title}
            </h1>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              by {getArtistName()}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Album Cover */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <img
                  src={album.cover_art}
                  alt={album.title}
                  className="w-full aspect-square rounded-xl shadow-2xl object-cover"
                />
                <div>
                  <h2
                    className={`text-2xl font-bold ${themeClasses.text} mb-2`}
                  >
                    {album.title}
                  </h2>
                  <p className={`text-lg ${themeClasses.textSecondary} mb-4`}>
                    {getArtistName()}
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Contributing Artist:
                      </span>
                      <span className={themeClasses.text}>
                        {getArtistName()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Track Count:
                      </span>
                      <span className={themeClasses.text}>
                        {album.track_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Duration:
                      </span>
                      <span className={themeClasses.text}>
                        {formatAlbumDuration(album.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Affiliation:
                      </span>
                      <span className={themeClasses.text}>
                        {album.affiliation || "Music Label"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>Genre:</span>
                      <span className={themeClasses.text}>
                        {getGenreName()}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Track Details */}
            <div className="lg:col-span-1">
              <div className="text-center mb-8">
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                  Track {currentTrack + 1} of{" "}
                  {tracks.length || album.track_count}
                </h3>
                {loadingTracks ? (
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Loading track information...
                  </p>
                ) : currentTrackData ? (
                  <>
                    <p
                      className={`text-2xl font-bold ${themeClasses.text} mb-4`}
                    >
                      {currentTrackData.title}
                    </p>
                    <p
                      className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-6`}
                    >
                      {currentTrackData.trackDescription ||
                        album.description ||
                        "No description available"}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-2xl font-bold ${themeClasses.text} mb-4`}
                    >
                      {album.title}
                    </p>
                    <p
                      className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-6`}
                    >
                      {album.description || "No description available"}
                    </p>
                  </>
                )}

                {/* Next & Previous Buttons */}
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={handlePrevTrack}
                    disabled={
                      tracks.length === 0 || currentTrack >= tracks.length - 1
                    }
                    className={`px-4 py-2 rounded-lg font-bold ${
                      currentTrack === 0 || tracks.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextTrack}
                    disabled={
                      currentTrack === tracks.length - 1 || tracks.length === 0
                    }
                    className={`px-4 py-2 rounded-lg font-bold ${
                      currentTrack === tracks.length - 1 || tracks.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <h4
                  className={`font-bold ${themeClasses.text} text-center mb-4`}
                >
                  Song Credits
                </h4>
                {currentTrackData ? (
                  <>
                    {currentTrackData.producer && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Produced By:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.producer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.masteringEngineer && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Mastered By:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.masteringEngineer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.mixingEngineer && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Mixed By:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.mixingEngineer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.writer && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Written By:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.writer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.featuredArtists && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Featuring:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.featuredArtists}
                        </span>
                      </div>
                    )}
                    {currentTrackData.backingVocals && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Backing Vocals:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.backingVocals}
                        </span>
                      </div>
                    )}
                    {currentTrackData.instrumentation && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Instrumentalists:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.instrumentation}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Duration:
                      </span>
                      <span className={themeClasses.text}>
                        {formatDuration(currentTrackData.durationMs)}
                      </span>
                    </div>
                    {currentTrackData.specialCredits && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Special Credits:
                        </span>
                        <span className={themeClasses.text}>
                          {currentTrackData.specialCredits}
                        </span>
                      </div>
                    )}
                    {currentTrackData.releaseDate && (
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>
                          Release Date:
                        </span>
                        <span className={themeClasses.text}>
                          {formatDate(currentTrackData.releaseDate)}
                        </span>
                      </div>
                    )}
                  </>
                ) : album.credits ? (
                  <div className="whitespace-pre-wrap text-center">
                    <span className={themeClasses.text}>{album.credits}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className={themeClasses.textSecondary}>
                      No track credits available
                    </span>
                  </div>
                )}
                {!currentTrackData && (
                  <>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Release Date:
                      </span>
                      <span className={themeClasses.text}>
                        {formatDate(album.release_date)}
                      </span>
                    </div>
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
                  </>
                )}
              </div>

              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        album.color?.includes("purple")
                          ? "bg-purple-500"
                          : album.color?.includes("blue")
                          ? "bg-blue-500"
                          : album.color?.includes("red")
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Album Performance */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <img
                  src={album.cover_art}
                  alt="Album Award"
                  className="w-full aspect-square rounded-xl shadow-2xl object-cover"
                />
                <div>
                  <h3
                    className={`text-2xl font-bold ${themeClasses.text} text-center mb-6`}
                  >
                    Album Performance
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        USD Support:
                      </span>
                      <span className={`font-bold ${themeClasses.text}`}>
                        $ 101,512.50
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        ZiG Support:
                      </span>
                      <span className={`font-bold ${themeClasses.text}`}>
                        $ 1,901,512.50
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Plaque Count:
                      </span>
                      <span className={`font-bold ${themeClasses.text}`}>
                        125
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Time Left:
                      </span>
                      <span className={`font-bold ${themeClasses.text}`}>
                        2 Hrs 39 Mins 45 Sec
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Status:
                      </span>
                      <span className={`font-bold ${themeClasses.text}`}>
                        {album.is_published ? "Published" : "Unpublished"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Slider and Support Button */}
          <div
            className={`border-t ${themeClasses.border} mt-8 pt-8 space-y-6`}
          >
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-gray-300 dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                    (selectedAmount / 1000) * 100
                  }%, ${isDarkMode ? "#374151" : "#d1d5db"} ${
                    (selectedAmount / 1000) * 100
                  }%, ${isDarkMode ? "#374151" : "#d1d5db"} 100%)`,
                }}
              />
              <span className="text-2xl font-bold text-green-500 min-w-20 text-right">
                ${selectedAmount}
              </span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-12 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                SUPPORT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        albumName={album.title}
        albumArtist={getArtistName()}
        albumImage={album.cover_art}
        supportAmount={selectedAmount}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default AlbumPage;
