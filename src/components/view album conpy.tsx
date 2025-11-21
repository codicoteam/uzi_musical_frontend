import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PaymentModal from "../components/home/payment";
import trackService from "../services/tracks_service";
import albumService from "../services/album_service";

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
}

interface ArtistRef {
  _id: string;
  name: string;
  bio?: string;
  profilePictureUrl?: string;
  cover_photo?: string;
}

interface GenreRef {
  _id: string;
  name: string;
}

interface Plaque {
  _id: string;
  plaque_type: string; // e.g., Gold, Silver, Emerald
  plaque_image_url: string;
  plaque_price_range: string; // "$600 - $1200"
}

interface Album {
  _id?: string;
  title: string;
  artist: ArtistRef | string;
  genre: GenreRef | string;
  cover_art: string;
  release_date: string;
  track_count: number;
  description?: string;
  is_featured?: boolean;
  copyright_info?: string;
  publisher?: string;
  credits?: string;
  affiliation?: string;
  duration?: number; // seconds
  is_published?: boolean;
  color?: string;
  tracks?: Track[];
  plaqueArray?: Plaque[];
}

const parsePriceRange = (range: string): [number, number] | null => {
  if (!range) return null;
  const nums = range
    .replace(/\$/g, "")
    .split("-")
    .map((s) => Number(String(s).trim()))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 2) return [nums[0], nums[1]];
  return null;
};

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const AlbumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { albumId } = useParams<{ albumId: string }>();

  const [isDarkMode] = useState(false);

  // Payment / Support
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  // Album state (prefer fetched by ID; fallback to navigation state)
  const [album, setAlbum] = useState<Album | undefined>(
    (location.state?.album as Album | undefined) || undefined
  );
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);

  // Track state
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [, setTracksError] = useState<string | null>(null);

  // Theme helpers
  const themeClasses = {
    bg: isDarkMode ? "bg-gray-950" : "bg-white",
    card: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-slate-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-800" : "border-slate-200",
    subtle: isDarkMode ? "bg-gray-800/60" : "bg-slate-50",
  };

  // -------- Fetch Album by ID (with token) --------
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!albumId || (album && album._id === albumId)) return;

      try {
        setLoadingAlbum(true);
        setAlbumError(null);
        const token =
          (typeof window !== "undefined" &&
            (localStorage.getItem("token") ||
              sessionStorage.getItem("token"))) ||
          "";

        const response = await albumService.getAlbumById(albumId, token);
        setAlbum(response?.album || response || undefined);
      } catch (err: any) {
        setAlbumError(err?.message || "Failed to load album.");
        if (!album) navigate("/", { replace: true });
      } finally {
        setLoadingAlbum(false);
      }
    };

    fetchAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  // Redirect if neither album nor state provided and no albumId
  useEffect(() => {
    if (!album && !albumId && !location.state) {
      navigate("/", { replace: true });
    }
  }, [album, albumId, location.state, navigate]);

  // -------- Fetch Tracks for Album --------
  useEffect(() => {
    const fetchTracks = async () => {
      const idToUse = album?._id || albumId;
      if (!idToUse) return;

      try {
        setLoadingTracks(true);
        setTracksError(null);
        const response = await trackService.getTracksByAlbumId(idToUse);
        const tracksData: Track[] = response?.tracks || [];
        const sorted = [...tracksData].sort((a, b) => {
          const an = a.trackNumber ?? 0;
          const bn = b.trackNumber ?? 0;
          return an - bn;
        });
        setTracks(sorted);
        setCurrentTrack(0);
      } catch (err: any) {
        console.error("Error fetching tracks:", err);
        setTracks([]);
        setTracksError(err?.message || "Failed to load tracks.");
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchTracks();
  }, [album?._id, albumId]);

  const currentTrackData = tracks[currentTrack];

  // -------- Plaque/Price Slider Computations --------
  const allPlaqueRanges = useMemo(() => {
    const arr = album?.plaqueArray || [];
    const parsed = arr
      .map((p) => {
        const r = parsePriceRange(p.plaque_price_range);
        return r ? { plaque: p, min: r[0], max: r[1] } : null;
      })
      .filter(Boolean) as { plaque: Plaque; min: number; max: number }[];

    const min = parsed.length ? Math.min(...parsed.map((x) => x.min)) : 0;
    const max = parsed.length ? Math.max(...parsed.map((x) => x.max)) : 1000;

    return { parsed, globalMin: min, globalMax: max };
  }, [album?.plaqueArray]);

  useEffect(() => {
    setSelectedAmount((prev) => {
      const base = allPlaqueRanges.globalMin;
      if (prev >= base && prev <= allPlaqueRanges.globalMax) return prev;
      return base;
    });
  }, [allPlaqueRanges.globalMin, allPlaqueRanges.globalMax]);

  const matchedPlaque = useMemo(() => {
    const amt = selectedAmount;
    const hit =
      allPlaqueRanges.parsed.find((x) => amt >= x.min && amt <= x.max) || null;
    return hit ? hit.plaque : null;
  }, [selectedAmount, allPlaqueRanges.parsed]);

  const sliderMin = allPlaqueRanges.globalMin;
  const sliderMax = allPlaqueRanges.globalMax;

  // -------- UI Helpers --------
  const handleBack = () => navigate(-1);

  const handleNextTrack = () => {
    if (tracks.length > 0 && currentTrack < tracks.length - 1) {
      setCurrentTrack((i) => i + 1);
    }
  };

  const handlePrevTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack((i) => i - 1);
    }
  };

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
    if (hours > 0) return `${hours} Hr ${minutes} Mins ${seconds} Sec`;
    return `${minutes} Mins ${seconds} Sec`;
  };

  const formatAlbumDuration = (duration?: number) => {
    if (!duration) return "0 Hr 0 Mins 0 Sec";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours} Hr ${minutes} Mins ${seconds} Sec`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
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

  // ---------- Skeletons (Shimmer) ----------
  const Box = ({ className = "" }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-lg ${
        isDarkMode ? "bg-gray-800" : "bg-slate-200"
      } ${className}`}
    />
  );

  if (!album) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}
      >
        <div className="text-center">
          <p className={themeClasses.text}>
            {albumError
              ? albumError
              : loadingAlbum
              ? "Loading album..."
              : "Album not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <header
        className={`border-b ${themeClasses.border} p-4 sm:p-6 sticky top-0 z-10 ${themeClasses.card}/80 backdrop-blur`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className={`p-2 rounded-xl border ${themeClasses.border} ${themeClasses.subtle} hover:shadow`}
            aria-label="Go back"
          >
            <ArrowLeft className={`w-5 h-5 ${themeClasses.text}`} />
          </button>
          <div className="min-w-0">
            <h1
              className={`truncate text-xl sm:text-2xl font-bold ${themeClasses.text}`}
            >
              {album.title}
            </h1>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              by {getArtistName()}
            </p>
            {loadingAlbum && (
              <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                Loading album…
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* wider page */}
        <div className="max-w-7xl mx-auto">
          {/* shift to 12-col; make center (track info) wider */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Album Cover & Meta */}
            <div className="lg:col-span-3">
              <div
                className={`space-y-6 rounded-2xl p-4 sm:p-5 border ${themeClasses.border} ${themeClasses.card} shadow-sm`}
              >
                {loadingAlbum ? (
                  <>
                    <Box className="w-full aspect-square" />
                    <Box className="h-7 w-3/4" />
                    <Box className="h-5 w-1/2" />
                    <div className="space-y-3">
                      <Box className="h-4 w-full" />
                      <Box className="h-4 w-5/6" />
                      <Box className="h-4 w-4/6" />
                      <Box className="h-4 w-3/6" />
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={album.cover_art}
                      alt={album.title}
                      className="w-full aspect-square rounded-xl shadow-md object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h2
                        className={`text-2xl font-bold ${themeClasses.text} mb-1`}
                      >
                        {album.title}
                      </h2>
                      <p
                        className={`text-sm ${themeClasses.textSecondary} mb-4`}
                      >
                        {getArtistName()}
                      </p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Contributing Artist
                          </span>
                          <span className={themeClasses.text}>
                            {getArtistName()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Track Count
                          </span>
                          <span className={themeClasses.text}>
                            {album.track_count}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Duration
                          </span>
                          <span className={themeClasses.text}>
                            {formatAlbumDuration(album.duration)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Affiliation
                          </span>
                          <span className={themeClasses.text}>
                            {album.affiliation || "Music Label"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Genre
                          </span>
                          <span className={themeClasses.text}>
                            {getGenreName()}
                          </span>
                        </div>
                        {album.publisher && (
                          <div className="flex items-center justify-between">
                            <span className={themeClasses.textSecondary}>
                              Publisher
                            </span>
                            <span className={themeClasses.text}>
                              {album.publisher}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center Column - Track Details (WIDER NOW) */}
            <div className="lg:col-span-6">
              <div
                className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} shadow-sm`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg sm:text-xl font-semibold ${themeClasses.text}`}
                    >
                      Track {tracks.length ? currentTrack + 1 : 0} of{" "}
                      {tracks.length || album.track_count}
                    </h3>

                    {/* Prev / Next */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevTrack}
                        disabled={tracks.length === 0 || currentTrack === 0}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                          themeClasses.border
                        }
                          ${
                            tracks.length === 0 || currentTrack === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-blue-50 hover:border-blue-200 text-blue-700"
                          }`}
                        aria-label="Previous track"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextTrack}
                        disabled={
                          tracks.length === 0 ||
                          currentTrack === tracks.length - 1
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                          themeClasses.border
                        }
                          ${
                            tracks.length === 0 ||
                            currentTrack === tracks.length - 1
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-blue-50 hover:border-blue-200 text-blue-700"
                          }`}
                        aria-label="Next track"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {loadingTracks ? (
                    <div className="space-y-4">
                      <Box className="w-full max-w-md mx-auto aspect-square" />
                      <Box className="h-7 w-2/3 mx-auto" />
                      <Box className="h-4 w-28 mx-auto" />
                      <Box className="h-16 w-full" />
                    </div>
                  ) : (
                    <>
                      {/* Track Art */}
                      {currentTrackData?.trackArt && (
                        <img
                          src={currentTrackData.trackArt}
                          alt={currentTrackData.title}
                          className="w-full max-w-lg mx-auto aspect-square rounded-xl shadow-md object-cover mb-4"
                          loading="lazy"
                        />
                      )}

                      {/* Title & Description */}
                      {currentTrackData ? (
                        <>
                          <p
                            className={`text-2xl font-bold ${themeClasses.text} text-center mb-2`}
                          >
                            {currentTrackData.title}
                          </p>
                          {typeof currentTrackData.trackNumber === "number" && (
                            <p
                              className={`text-xs ${themeClasses.textSecondary} text-center mb-3`}
                            >
                              Track #{currentTrackData.trackNumber}
                            </p>
                          )}
                          <p
                            className={`text-sm ${themeClasses.textSecondary} leading-relaxed text-center sm:text-left`}
                          >
                            {currentTrackData.trackDescription ||
                              album.description ||
                              "No description available"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p
                            className={`text-2xl font-bold ${themeClasses.text} text-center mb-3`}
                          >
                            {album.title}
                          </p>
                          <p
                            className={`text-sm ${themeClasses.textSecondary} leading-relaxed text-center sm:text-left`}
                          >
                            {album.description || "No description available"}
                          </p>
                        </>
                      )}

                      {/* Song Credits & Details */}
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <h4
                          className={`sm:col-span-2 font-semibold ${themeClasses.text} mb-1`}
                        >
                          Song Credits
                        </h4>

                        {currentTrackData ? (
                          <>
                            {currentTrackData.producer && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Produced By
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.producer}
                                </span>
                              </div>
                            )}
                            {currentTrackData.masteringEngineer && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Mastered By
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.masteringEngineer}
                                </span>
                              </div>
                            )}
                            {currentTrackData.mixingEngineer && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Mixed By
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.mixingEngineer}
                                </span>
                              </div>
                            )}
                            {currentTrackData.writer && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Written By
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.writer}
                                </span>
                              </div>
                            )}
                            {currentTrackData.featuredArtists &&
                              currentTrackData.featuredArtists.trim() && (
                                <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                  <span className={themeClasses.textSecondary}>
                                    Featuring
                                  </span>
                                  <span className={themeClasses.text}>
                                    {currentTrackData.featuredArtists}
                                  </span>
                                </div>
                              )}
                            {currentTrackData.backingVocals && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Backing Vocals
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.backingVocals}
                                </span>
                              </div>
                            )}
                            {currentTrackData.instrumentation && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Instrumentation
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.instrumentation}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                              <span className={themeClasses.textSecondary}>
                                Duration
                              </span>
                              <span className={themeClasses.text}>
                                {formatDuration(currentTrackData.durationMs)}
                              </span>
                            </div>
                            {currentTrackData.specialCredits && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Special Credits
                                </span>
                                <span className={themeClasses.text}>
                                  {currentTrackData.specialCredits}
                                </span>
                              </div>
                            )}
                            {currentTrackData.releaseDate && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Release Date
                                </span>
                                <span className={themeClasses.text}>
                                  {formatDate(currentTrackData.releaseDate)}
                                </span>
                              </div>
                            )}
                          </>
                        ) : album.credits ? (
                          <div className="sm:col-span-2 whitespace-pre-wrap rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                            <span className={themeClasses.text}>
                              {album.credits}
                            </span>
                          </div>
                        ) : (
                          <div className="sm:col-span-2 text-center">
                            <span className={themeClasses.textSecondary}>
                              No track credits available
                            </span>
                          </div>
                        )}

                        {!currentTrackData && (
                          <>
                            <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                              <span className={themeClasses.textSecondary}>
                                Release Date
                              </span>
                              <span className={themeClasses.text}>
                                {formatDate(album.release_date)}
                              </span>
                            </div>
                            {album.copyright_info && (
                              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent hover:border-slate-200">
                                <span className={themeClasses.textSecondary}>
                                  Copyright
                                </span>
                                <span className={themeClasses.text}>
                                  {album.copyright_info}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Color Dots */}
                      <div className="flex justify-center mt-8">
                        <div className="flex gap-1">
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
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Plaque */}
            <div className="lg:col-span-3">
              <div
                className={`space-y-6 rounded-2xl p-4 sm:p-5 border ${themeClasses.border} ${themeClasses.card} shadow-sm`}
              >
                {loadingAlbum ? (
                  <>
                    <Box className="w-full aspect-square" />
                    <Box className="h-7 w-2/3 mx-auto" />
                    <div className="space-y-3">
                      <Box className="h-4 w-full" />
                      <Box className="h-4 w-5/6" />
                      <Box className="h-4 w-4/6" />
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={matchedPlaque?.plaque_image_url || album.cover_art}
                      alt={
                        matchedPlaque
                          ? `${matchedPlaque.plaque_type} Plaque`
                          : "Album Art"
                      }
                      className="w-full aspect-square rounded-xl shadow-md object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3
                        className={`text-2xl font-bold ${themeClasses.text} text-center mb-6`}
                      >
                        {matchedPlaque
                          ? `${matchedPlaque.plaque_type} Plaque`
                          : "Select a Plaque"}
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Selected Amount
                          </span>
                          <span className={`font-bold ${themeClasses.text}`}>
                            ${selectedAmount.toLocaleString()}
                          </span>
                        </div>

                        {matchedPlaque ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className={themeClasses.textSecondary}>
                                Price Range
                              </span>
                              <span
                                className={`font-bold ${themeClasses.text}`}
                              >
                                {matchedPlaque.plaque_price_range}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={themeClasses.textSecondary}>
                                Plaque Type
                              </span>
                              <span
                                className={`font-bold ${themeClasses.text}`}
                              >
                                {matchedPlaque.plaque_type}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <span className={themeClasses.textSecondary}>
                              Move the slider to match a plaque range.
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={themeClasses.textSecondary}>
                            Status
                          </span>
                          <span className={`font-bold ${themeClasses.text}`}>
                            {album.is_published ? "Published" : "Unpublished"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section - Slider and Support Button */}
          <div
            className={`border-t ${themeClasses.border} mt-8 pt-8 space-y-6`}
          >
            <div className="flex items-center gap-4">
              <div className="min-w-14 text-xs font-medium text-slate-500">
                ${sliderMin.toLocaleString()}
              </div>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                value={selectedAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedAmount(clamp(val, sliderMin, sliderMax));
                }}
                className="flex-1 h-2 appearance-none rounded-full bg-slate-200 dark:bg-gray-800 accent-green-500"
              />
              <div className="min-w-14 text-right text-xs font-medium text-slate-500">
                ${sliderMax.toLocaleString()}
              </div>
              <span className="text-2xl font-bold text-green-600 min-w-28 text-right tabular-nums">
                ${selectedAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-12 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
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
        albumImage={matchedPlaque?.plaque_image_url || album.cover_art}
        supportAmount={selectedAmount}
        isDarkMode={isDarkMode}
        albumId={album._id} // ACTUAL ALBUM ID PASSED HERE
        plaqueType={matchedPlaque?.plaque_type} // Pass the actual plaque type
      />
    </div>
  );
};

export default AlbumPage;