import { useState } from "react";
import {
  Menu,
  ChevronDown,
  Calendar,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import albumService from "../services/album_service"; // Adjust the import path as needed

interface Album {
  _id: string;
  artist: Artist | string; 
  title: string;
  release_date: string;
  genre?: Genre | string; 
  cover_art?: string;
  description?: string;
  track_count: number;
  copyright_info?: string;
  publisher?: string;
  credits?: string;
  affiliation?: string;
  duration?: number;
  is_published: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data?: Album[];
  albums?: Album[];
  // Add other possible response properties based on your API
}

const AlbumScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"collection" | "stats">("collection");
  const navigate = useNavigate();

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

  // Fetch albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response: ApiResponse = await albumService.getAllAlbums();
        
        // Handle different possible response structures
        let albumsData: Album[] = [];
        
        if (Array.isArray(response)) {
          // If response is directly an array
          albumsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          // If response has a data property that contains the array
          albumsData = response.data;
        } else if (response.albums && Array.isArray(response.albums)) {
          // If response has an albums property that contains the array
          albumsData = response.albums;
        } else if (Array.isArray(response)) {
          // If the response itself is the array
          albumsData = response;
        } else {
          console.warn("Unexpected API response structure:", response);
          albumsData = [];
        }
        
        setAlbums(albumsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch albums. Please try again later.");
        console.error("Error fetching albums:", err);
        setAlbums([]); // Ensure albums is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Safe reduce with fallback to empty array
  const totalSpent = albums?.reduce((sum, album) => sum + (album.cost || 0), 0) || 0;

  const handleAlbumClick = (album: Album) => {
    // All albums go to the same route
    navigate(`/details1`, { state: { album } });
  };

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

            {/* User */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-3 pl-4 border-l ${themeClasses.border}`}>
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${themeClasses.text}`}>{userName}</div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>Admin</div>
                </div>

                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
            {["collection"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "collection")}
                className={`capitalize px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-linear-to-r from-red-700 to-red-500 text-white shadow-md"
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
                      <Music className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className={`text-xs ${themeClasses.textSecondary}`}>Total Albums</p>
                        <p className={`text-2xl font-bold ${themeClasses.text}`}>
                          {albums.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Album Grid */}
                {!loading && !error && albums && albums.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {albums.map((album) => (
                      <motion.div
                        key={album.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`cursor-pointer group relative overflow-hidden rounded-2xl ${themeClasses.card} border ${themeClasses.border} backdrop-blur-sm hover:shadow-2xl`}
                        onClick={() => handleAlbumClick(album)}
                      >
                        <img
                          src={album.image}
                          alt={album.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-lg font-bold">{album.title}</h3>
                          <p className="text-sm opacity-80">{album.artist}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && (!albums || albums.length === 0) && (
                  <div className="flex justify-center items-center py-12">
                    <div className={`text-center ${themeClasses.text}`}>
                      <p className="text-lg font-semibold">No albums found</p>
                      <p className={themeClasses.textSecondary}>Your album collection is empty</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AlbumScreen;
function useEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}

function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setAlbums(albumsData: Album[]) {
  throw new Error("Function not implemented.");
}

function setError(arg0: null) {
  throw new Error("Function not implemented.");
}

