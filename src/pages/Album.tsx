import { useState } from "react";
import {
  Menu,
  ChevronDown,
  DollarSign,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";

interface Album {
  id: number;
  title: string;
  artist: string;
  genre: string;
  cost: number;
  releaseDate: string;
  tracks: number;
  description: string;
  image: string;
  color: string;
  rating: string;
}

const AlbumScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"collection" | "stats">("collection");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const userName = "John Doe";

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

  const albums: Album[] = [
    {
      id: 1,
      title: "Midnight Melodies",
      artist: "Luna Aurora",
      genre: "Pop",
      cost: 14.99,
      releaseDate: "2024-09-15",
      tracks: 12,
      description: "A dreamy pop journey through midnight emotions and cosmic sounds.",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      color: "from-purple-500 to-pink-500",
      rating: "4.5",
    },
    {
      id: 2,
      title: "City Lights",
      artist: "Neon Dreams",
      genre: "Electronic",
      cost: 12.49,
      releaseDate: "2024-07-10",
      tracks: 10,
      description: "Pulsing synth beats and vibrant energy inspired by neon-lit city nights.",
      image: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&h=400&fit=crop",
      color: "from-cyan-500 to-blue-500",
      rating: "4.8",
    },
    {
      id: 3,
      title: "Acoustic Souls",
      artist: "Sarah Harmony",
      genre: "Folk",
      cost: 11.99,
      releaseDate: "2024-06-21",
      tracks: 9,
      description: "Heartfelt acoustic melodies that capture love, loss, and life’s simplicity.",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
      color: "from-emerald-500 to-teal-500",
      rating: "4.2",
    },
  ];

  const totalSpent = albums.reduce((sum, album) => sum + album.cost, 0);

  return (
    <div className={`flex h-screen ${themeClasses.bg} relative transition-colors duration-300 overflow-hidden`}>
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
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-[290px] pl-6 sm:pl-8">
        {/* Header */}
        <header
          className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b ${themeClasses.border} px-4 sm:px-6 py-4 fixed top-0 left-0 lg:left-[270px] right-0 z-30`}
        >
          <div className="flex items-center justify-between">
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
                <span className={themeClasses.textSecondary}>Home</span>
                <span className="text-slate-400">›</span>
                <span className={`${themeClasses.text} font-medium`}>Albums</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}>
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${themeClasses.text}`}>{userName}</div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>Admin</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <span className="text-white font-semibold text-sm">
                      {userName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <ChevronDown className={`w-4 h-4 ${themeClasses.textSecondary}`} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto scroll-smooth pt-[84px] pb-8 pr-4 sm:pr-6">
          <div className="flex space-x-4 pb-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-opacity-80 backdrop-blur-md z-10">
            {["collection" ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "collection")}
                className={`capitalize px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : `${themeClasses.textSecondary} hover:bg-slate-100`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* COLLECTION TAB */}
          <AnimatePresence mode="wait">
            {activeTab === "collection" && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-8 mt-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text}`}>
                      My Album Collection
                    </h1>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      Your curated music library
                    </p>
                  </div>
                  <div className={`${themeClasses.card} backdrop-blur-sm border ${themeClasses.border} rounded-2xl px-6 py-4`}>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <div>
                        <p className={`text-xs ${themeClasses.textSecondary}`}>Total Spent</p>
                        <p className={`text-2xl font-bold ${themeClasses.text}`}>
                          ${totalSpent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Album Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`cursor-pointer group relative overflow-hidden rounded-2xl ${themeClasses.card} border ${themeClasses.border} backdrop-blur-sm hover:shadow-2xl`}
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <img
                        src={album.image}
                        alt={album.title}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-bold">{album.title}</h3>
                        <p className="text-sm opacity-80">{album.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* FULL ALBUM DETAILS MODAL */}
      <AnimatePresence>
        {selectedAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-6xl rounded-2xl ${themeClasses.card} border ${themeClasses.border} shadow-xl overflow-hidden`}
            >
              <div className="relative overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-200"
                  onClick={() => setSelectedAlbum(null)}
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-4">
                    <img
                      src={selectedAlbum.image}
                      alt={selectedAlbum.title}
                      className="w-full aspect-square rounded-xl shadow-2xl"
                    />
                    <div>
                      <h2 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>{selectedAlbum.title}</h2>
                      <p className={`text-lg ${themeClasses.textSecondary} mb-2`}>{selectedAlbum.artist}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>Contributing Artist:</span>
                          <span className={themeClasses.text}>{selectedAlbum.artist}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>Album Track Count:</span>
                          <span className={themeClasses.text}>{selectedAlbum.tracks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>Album Duration:</span>
                          <span className={themeClasses.text}>1 Hr 12 Mins 15 Sec</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeClasses.textSecondary}>Album Affiliation:</span>
                          <span className={themeClasses.text}>Music Label</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column */}
                  <div className="lg:col-span-1 text-center">
                    <h3 className={`text-xl font-bold ${themeClasses.text} mb-1`}>Track 01 of {selectedAlbum.tracks}</h3>
                    <p className={`text-2xl font-bold ${themeClasses.text} mb-4`}>{selectedAlbum.title}</p>
                    <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-6`}>{selectedAlbum.description}</p>

                    <div className="space-y-3 text-sm">
                      <h4 className={`font-bold ${themeClasses.text} text-center mb-3`}>Song Credits</h4>
                      {[
                        ["Produced By:", "Producer Name"],
                        ["Mastered By:", "Master Engineer"],
                        ["Written By:", "Songwriter"],
                        ["Featuring:", "Featured Artist"],
                        ["Backing Vocals:", "Vocal Artists"],
                        ["Instrumentalists:", "Musicians"],
                        ["Duration:", "3 mins 45 Sec"],
                        ["Special Credits:", "Special Thanks"],
                        ["Release Date:", selectedAlbum.releaseDate],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className={themeClasses.textSecondary}>{label}</span>
                          <span className={themeClasses.text}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-1 space-y-4">
                    <img
                      src={selectedAlbum.image}
                      alt="Album Award"
                      className="w-full aspect-square rounded-xl shadow-2xl"
                    />
                    <div>
                      <h3 className={`text-2xl font-bold ${themeClasses.text} text-center mb-4`}>Album Performance</h3>
                      <div className="space-y-3 text-sm">
                        {[
                          ["USD Support:", "$101,512.50"],
                          ["ZiG Support:", "$1,901,512.50"],
                          ["Plaque Count:", "125"],
                          ["Time Left:", "2 Hrs 39 Mins 45 Sec"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className={themeClasses.textSecondary}>{label}</span>
                            <span className={`font-bold ${themeClasses.text}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlbumScreen;
