import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import PaymentModal from "../components/home/payment";
import trackService from "../services/tracks_service";
import albumService from "../services/album_service";
import cover2 from "../assets/replacementcover/cover6.png";
import cover from "../assets/replacementcover/cover6.png";
//plaques
import goldPlaque from "../assets/plaques/gol.png";
import silverPlaque from "../assets/plaques/sil.png";
import emeraldPlaque from "../assets/plaques/gree.png";
import sapphirePlaque from "../assets/plaques/blue.png";
import crimsonPlaque from "../assets/plaques/red.png";
import woodPlaque from "../assets/plaques/wodden.png";
import thankYouPlaque from "../assets/plaques/sil.png";

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
  plaque_type: string;
  plaque_image_url: string;
  plaque_price_range: string;
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
  duration?: number;
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

const AlbumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { albumId } = useParams<{ albumId: string }>();

  const [isDarkMode] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [album, setAlbum] = useState<Album | undefined>(
    (location.state?.album as Album | undefined) || undefined
  );
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [, setTracksError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  //Debug
  useEffect(() => {
    console.log("=== DEBUGGING TOKEN ===");
    console.log("localStorage.token:", localStorage.getItem("token"));
    console.log("sessionStorage.token:", sessionStorage.getItem("token"));
    console.log("localStorage.userLogin:", localStorage.getItem("userLogin"));
    console.log(
      "sessionStorage.userLogin:",
      sessionStorage.getItem("userLogin")
    );
    console.log("All localStorage keys:", Object.keys(localStorage));
  }, []);

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
  }, [albumId]);

  useEffect(() => {
    if (!album && !albumId && !location.state) {
      navigate("/", { replace: true });
    }
  }, [album, albumId, location.state, navigate]);

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
    return album?.plaqueArray?.find((p) => {
      const range = parsePriceRange(p.plaque_price_range);
      return range && selectedAmount >= range[0] && selectedAmount <= range[1];
    });
  }, [album?.plaqueArray, selectedAmount]);

  const getDisplayPlaque = useMemo(() => {
    const amt = selectedAmount;

    // Map plaque types to imported images
    const plaqueImages: { [key: string]: string } = {
      gold: goldPlaque,
      silver: silverPlaque,
      emerald: emeraldPlaque,
      sapphire: sapphirePlaque,
      crimson: crimsonPlaque,
      wood: woodPlaque,
      thank: thankYouPlaque,
    };

    if (amt >= 1000) return { type: "Gold", image: plaqueImages.gold };
    if (amt >= 900) return { type: "Silver", image: plaqueImages.silver };
    if (amt >= 700) return { type: "Emerald", image: plaqueImages.emerald };
    if (amt >= 500) return { type: "Sapphire", image: plaqueImages.sapphire };
    if (amt >= 300) return { type: "Crimson", image: plaqueImages.crimson };
    if (amt >= 100) return { type: "Wood Plaque", image: plaqueImages.wood };
    if (amt >= 50) return { type: "Thank You", image: plaqueImages.thank };

    return { type: "Custom Support", image: album?.cover_art };
  }, [selectedAmount, album?.cover_art]);
  const sliderMin = 1;
  const sliderMax = 1000;

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
    if (!durationMs) return "0:00";
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatAlbumDuration = (duration?: number) => {
    if (!duration) return "0 min";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      return "Unknown";
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-900 mb-4">
            {albumError
              ? albumError
              : loadingAlbum
              ? "Loading album..."
              : "Album not found"}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-900" />
          </button>
          {loadingAlbum && (
            <span className="text-sm text-slate-500">Loading...</span>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-6 pb-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Album Cover */}
            <div className="w-full md:w-64 shrink-0">
              <img
                src={album.cover_art}
                alt={album.title}
                className="w-full aspect-square object-cover shadow-2xl rounded-lg"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = cover2;
                }}
              />
            </div>

            {/* Album Info */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-sm font-semibold text-slate-900 mb-2">ALBUM</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-4 tracking-tight">
                {album.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-900 flex-wrap">
                <span className="font-semibold">{getArtistName()}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {formatDate(album.release_date)}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {album.track_count} songs
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {formatAlbumDuration(album.duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Track List & Current Track */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Track Player Card */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-900">
                      Track {tracks.length ? currentTrack + 1 : 0} of{" "}
                      { album.track_count}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevTrack}
                      disabled={tracks.length === 0 || currentTrack === 0}
                      className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      aria-label="Previous track"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-900" />
                    </button>
                    <button
                      onClick={handleNextTrack}
                      disabled={
                        tracks.length === 0 ||
                        currentTrack === tracks.length - 1
                      }
                      className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      aria-label="Next track"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-900" />
                    </button>
                  </div>
                </div>

                {loadingTracks ? (
                  <div className="space-y-3">
                    <div className="h-32 bg-slate-200 animate-pulse rounded" />
                    <div className="h-6 bg-slate-200 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-slate-200 animate-pulse rounded w-1/2" />
                  </div>
                ) : (
                  <>
                    {currentTrackData && (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          {currentTrackData.trackArt && (
                            <img
                              src={currentTrackData.trackArt}
                              alt={currentTrackData.title}
                              className="w-20 h-20 object-cover rounded"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = cover2;
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                              {currentTrackData.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {currentTrackData.featuredArtists ||
                                getArtistName()}
                            </p>
                          </div>
                        </div>

                        {currentTrackData.trackDescription && (
                          <p className="text-sm text-slate-600 leading-relaxed wrap-break-word overflow-hidden">
                            {currentTrackData.trackDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Track Credits */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Credits
                </h3>
                {loadingTracks ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-slate-200 animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : currentTrackData ? (
                  <div className="space-y-1">
                    {currentTrackData.producer && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Producer</span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.producer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.writer && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Writer</span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.writer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.mixingEngineer && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Mixing Engineer
                        </span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.mixingEngineer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.masteringEngineer && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Mastering Engineer
                        </span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.masteringEngineer}
                        </span>
                      </div>
                    )}
                    {currentTrackData.backingVocals && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Backing Vocals
                        </span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.backingVocals}
                        </span>
                      </div>
                    )}
                    {currentTrackData.instrumentation && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Instrumentation
                        </span>
                        <span className="text-sm text-slate-900">
                          {currentTrackData.instrumentation}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Duration</span>
                      <span className="text-sm text-slate-900">
                        {formatDuration(currentTrackData.durationMs)}
                      </span>
                    </div>
                    {currentTrackData.releaseDate && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">
                          Release Date
                        </span>
                        <span className="text-sm text-slate-900">
                          {formatDate(currentTrackData.releaseDate)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Artist</span>
                      <span className="text-sm text-slate-900">
                        {getArtistName()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Genre</span>
                      <span className="text-sm text-slate-900">
                        {getGenreName()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        Release Date
                      </span>
                      <span className="text-sm text-slate-900">
                        {formatDate(album.release_date)}
                      </span>
                    </div>
                    {album.publisher && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">
                          Publisher
                        </span>
                        <span className="text-sm text-slate-900">
                          {album.publisher}
                        </span>
                      </div>
                    )}
                    {album.copyright_info && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">
                          Copyright
                        </span>
                        <span className="text-sm text-slate-900">
                          {album.copyright_info}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Album Description */}

              {album.description && (
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    About
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed wrap-break-word overflow-wrap-anywhere max-w-full">
                    {album.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right - Support Section */}
            <div className="space-y-6">
              {/* Plaque Preview */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Support the Artist
                </h3>
                {loadingAlbum ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-slate-200 animate-pulse rounded" />
                    <div className="h-6 bg-slate-200 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-slate-200 animate-pulse rounded w-1/2" />
                  </div>
                ) : (
                  <>
                    <img
                      src={getDisplayPlaque?.image || album.cover_art}
                      alt={
                        getDisplayPlaque
                          ? `${getDisplayPlaque.type} Plaque`
                          : "Album Art"
                      }
                      className="w-full aspect-square object-contain rounded mb-4"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = cover;
                      }}
                    />
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {getDisplayPlaque?.type || "Custom Support"}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          {getDisplayPlaque?.image
                            ? "Selected Plaque"
                            : "Choose Amount"}
                        </p>
                      </div>

                      <div className="flex justify-between items-baseline py-3 border-t border-slate-200">
                        <span className="text-sm text-slate-500">
                          Your contribution
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          ${selectedAmount.toLocaleString()}
                        </span>
                      </div>

                      {matchedPlaque && (
                        <div className="flex justify-between py-2 text-sm">
                          <span className="text-slate-500">Price range</span>
                          <span className="text-slate-900">
                            {matchedPlaque.plaque_price_range}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Slider */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>${sliderMin.toLocaleString()}</span>
                    <span>${sliderMax.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    value={
                      selectedAmount > sliderMax ? sliderMax : selectedAmount
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSelectedAmount(val);
                      if (val >= sliderMax) {
                        setShowCustomInput(true);
                      }
                    }}
                    className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:cursor-pointer"
                  />

                  {/* Custom Amount Input - Shows when activated */}
                  {showCustomInput && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-slate-500 uppercase tracking-wider">
                          Custom Amount
                        </label>
                        <button
                          onClick={() => {
                            setShowCustomInput(false);
                            setSelectedAmount(sliderMax);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          min={sliderMin}
                          value={selectedAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= sliderMin) {
                              setSelectedAmount(val);
                            }
                          }}
                          className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-slate-900"
                          placeholder="Enter amount"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Enter any amount $1 or higher
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      // Check for token in userLogin object
                      const userLogin =
                        localStorage.getItem("userLogin") ||
                        sessionStorage.getItem("userLogin");
                      const token = userLogin
                        ? JSON.parse(userLogin).token
                        : null;

                      if (!token) {
                        setShowLoginPrompt(true);
                      } else {
                        setIsPaymentModalOpen(true);
                      }
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition text-sm uppercase tracking-wider"
                  >
                    Support Now
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Album Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affiliation</span>
                    <span className="text-slate-900">
                      {album.affiliation || "Music Label"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="text-slate-900">
                      {album.is_published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Account Required
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              To support the artist, please create an account or log in first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-full transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition text-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        albumName={album.title}
        albumArtist={getArtistName()}
        albumImage={matchedPlaque?.plaque_image_url || album.cover_art}
        supportAmount={selectedAmount}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default AlbumPage;
