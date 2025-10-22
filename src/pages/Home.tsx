import { useState, useEffect } from "react";
import {
  Music,
  Users,
  DollarSign,
  Menu,
  ChevronDown,
  TrendingUp,
  Activity,
  Disc,
  Play,
} from "lucide-react";
import Sidebar from "../components/sidebar";

const HomeScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);

  // Mock data - replace with actual API calls
  const totalAlbums = 124;
  const totalArtists = 45;
  const totalTracks = 1847;
  const totalStreams = 2456789;

  const firstName = "John Doe"; // Replace with actual user data

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

  // Mock albums data
  const albums = [
    {
      id: 1,
      name: "Midnight Dreams",
      artist: "Luna Eclipse",
      genre: "Electronic",
      description: "A mesmerizing journey through ambient soundscapes and dreamy synths",
      tracks: 12,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "Urban Rhythms",
      artist: "Street Poets",
      genre: "Hip Hop",
      description: "Raw beats and powerful lyrics reflecting city life",
      tracks: 15,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 3,
      name: "Acoustic Sessions",
      artist: "Sarah Melody",
      genre: "Folk",
      description: "Intimate and heartfelt acoustic performances",
      tracks: 10,
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: 4,
      name: "Neon Nights",
      artist: "Synthwave Collective",
      genre: "Synthwave",
      description: "Retro-futuristic sounds with 80s vibes",
      tracks: 14,
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      color: "from-violet-500 to-purple-500",
    },
    {
      id: 5,
      name: "Jazz After Dark",
      artist: "The Blue Notes",
      genre: "Jazz",
      description: "Smooth jazz for late night listening",
      tracks: 11,
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: 6,
      name: "Rock Anthems",
      artist: "Thunder Road",
      genre: "Rock",
      description: "High-energy rock classics and new hits",
      tracks: 13,
      image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
      color: "from-red-500 to-orange-500",
    },
    {
      id: 7,
      name: "Classical Moments",
      artist: "Orchestra Symphony",
      genre: "Classical",
      description: "Timeless orchestral masterpieces",
      tracks: 16,
      image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop",
      color: "from-amber-500 to-yellow-500",
    },
    {
      id: 8,
      name: "Tropical Vibes",
      artist: "Island Groove",
      genre: "Reggae",
      description: "Feel-good reggae rhythms and island melodies",
      tracks: 12,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const metrics = [
    {
      label: "Total Albums",
      value: totalAlbums,
      unit: "",
      trend: "+12%",
      color: "from-purple-500 to-purple-600",
      bgColor: isDarkMode
        ? "bg-purple-900/20"
        : "bg-gradient-to-br from-purple-500/10 to-pink-500/5",
      borderColor: isDarkMode ? "border-purple-700/50" : "border-purple-200/50",
      icon: Disc,
    },
    {
      label: "Total Artists",
      value: totalArtists,
      unit: "",
      trend: "+8%",
      color: "from-pink-500 to-pink-600",
      bgColor: isDarkMode
        ? "bg-pink-900/20"
        : "bg-gradient-to-br from-pink-500/10 to-rose-500/5",
      borderColor: isDarkMode ? "border-pink-700/50" : "border-pink-200/50",
      icon: Users,
    },
    {
      label: "Total Tracks",
      value: totalTracks,
      unit: "",
      trend: "+15%",
      color: "from-violet-500 to-violet-600",
      bgColor: isDarkMode
        ? "bg-violet-900/20"
        : "bg-gradient-to-br from-violet-500/10 to-purple-500/5",
      borderColor: isDarkMode ? "border-violet-700/50" : "border-violet-200/50",
      icon: Music,
    },
    {
      label: "Total Streams",
      value: totalStreams,
      unit: "",
      trend: "+22%",
      color: "from-fuchsia-500 to-fuchsia-600",
      bgColor: isDarkMode
        ? "bg-fuchsia-900/20"
        : "bg-gradient-to-br from-fuchsia-500/10 to-pink-500/5",
      borderColor: isDarkMode ? "border-fuchsia-700/50" : "border-fuchsia-200/50",
      icon: Play,
    },
  ];

  // Animation effect for counters
  useEffect(() => {
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
  }, [totalAlbums, totalArtists, totalTracks, totalStreams]);

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
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
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
          {/* Stats Cards */}
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
                        className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r ${metric.color} shadow-sm`}
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
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full animate-progress-bar origin-left transform scale-x-0`}
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

          {/* Albums Section */}
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}>
                Current Albums
              </h2>
              <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} mt-1`}>
                Browse our latest music collection
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                >
                  {/* Album Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={album.image}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`p-3 sm:p-4 rounded-full bg-linear-to-r ${album.color} shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Genre Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r ${album.color} shadow-lg`}>
                        {album.genre}
                      </span>
                    </div>

                    {/* Track Count */}
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                      <Music className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      <span className="text-[10px] sm:text-xs font-semibold text-white">
                        {album.tracks} tracks
                      </span>
                    </div>
                  </div>

                  {/* Album Details */}
                  <div className="p-4 sm:p-5">
                    <h3 className={`text-base sm:text-lg font-bold ${themeClasses.text} mb-1 line-clamp-1`}>
                      {album.name}
                    </h3>
                    <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} mb-2 sm:mb-3`}>
                      {album.artist}
                    </p>

                    <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} leading-relaxed line-clamp-2 mb-3 sm:mb-4`}>
                      {album.description}
                    </p>

                    {/* Action Button */}
                    <button className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r ${album.color} hover:opacity-90 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-lg transform hover:scale-[1.02]`}>
                      View Album
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      </div>)};

      export default HomeScreen;