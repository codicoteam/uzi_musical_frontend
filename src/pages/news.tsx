import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Menu,
  ChevronDown,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import newsService from "../services/news_service";
import profileService from "../services/profile_service";

interface NewsItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  expires_at: string;
  is_published: boolean;
  likes?: number;
  comments?: number;
}

interface ApiResponse {
  data?: NewsItem[];
  news?: NewsItem[];
}

const MusicNewsScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedNews, setExpandedNews] = useState<Set<string>>(new Set());
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User state - same as other screens
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    userName: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-linear-to-br from-white via-red-50 to-red-100",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-white/50",
    header: isDarkMode ? "bg-gray-800/80" : "bg-white/80",
  };

  const [updates, setUpdates] = useState<any[]>([]);

  // Fetch user profile on component mount - same as other screens
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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response: ApiResponse | NewsItem[] = await newsService.getAllNews(
          1,
          10
        );

        let newsData: NewsItem[] = [];

        if (Array.isArray(response)) {
          newsData = response;
        } else if (Array.isArray(response.data)) {
          newsData = response.data;
        } else if (Array.isArray(response.news)) {
          newsData = response.news;
        } else {
          console.warn("Unexpected response:", response);
        }

        setNewsItems(newsData);

        // Generate updates from the latest news items
        const latestUpdates = newsData.slice(0, 3).map((item) => ({
          id: item._id,
          type: item.category,
          text: item.title,
          time: getTimeAgo(item.created_at),
          relatedNewsId: item._id,
        }));
        setUpdates(latestUpdates);

        setError(null);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to fetch news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const scrollToNews = (newsId: string) => {
    setSelectedNews(newsId);
    const element = document.getElementById(`news-${newsId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setSelectedNews(null), 2000);
    }
  };

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedNews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
          className={`${themeClasses.header} backdrop-blur-xl border-b ${themeClasses.border} px-4 sm:px-6 lg:px-8 py-3 sm:py-4 fixed top-0 left-0 lg:left-[270px] right-0 z-30`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } hover:bg-opacity-80`}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className={themeClasses.textSecondary}>Home</span>
                <span className="text-gray-400">›</span>
                <span className={`${themeClasses.text} font-medium`}>
                  Music News
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* User Profile - Same as other screens */}
              <div
                className={`hidden sm:flex items-center gap-3 pl-3 border-l ${themeClasses.border}`}
              >
                {!profileLoading && userProfile ? (
                  <>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${themeClasses.text}`}>
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
                          className="w-9 h-9 rounded-xl object-cover shadow-lg"
                          onError={(e) => {
                            console.error("Failed to load profile picture:", userProfile.profilePicture);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback avatar with initials - shown if no valid profile picture */}
                      {!isValidProfilePicture(userProfile.profilePicture) && (
                        <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                          <span className="text-white font-medium text-xs">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />
                  </>
                ) : (
                  // Loading state for user profile
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${themeClasses.text} animate-pulse`}>
                        Loading...
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary} animate-pulse`}>
                        User
                      </div>
                    </div>
                    <div className="w-9 h-9 bg-gray-300 rounded-xl animate-pulse"></div>
                    <ChevronDown
                      className={`w-4 h-4 ${themeClasses.textSecondary}`}
                    />
                  </div>
                )}
              </div>
              
              {/* Mobile User Profile */}
              <div className="sm:hidden relative">
                {!profileLoading && userProfile ? (
                  <>
                    {isValidProfilePicture(userProfile.profilePicture) ? (
                      <img
                        src={userProfile.profilePicture}
                        alt={getDisplayName()}
                        className="w-9 h-9 rounded-xl object-cover shadow-lg"
                        onError={(e) => {
                          console.error("Failed to load profile picture:", userProfile.profilePicture);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avatar with initials - shown if no valid profile picture */}
                    {!isValidProfilePicture(userProfile.profilePicture) && (
                      <div className="w-9 h-9 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                        <span className="text-white font-medium text-xs">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </>
                ) : (
                  // Loading state for user profile
                  <div className="w-9 h-9 bg-gray-300 rounded-xl animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pt-[68px] sm:pt-[76px] pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="music-news"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {/* Hero Section */}
              <div className="pt-6 pb-8">
                <div className="relative bg-linear-to-r from-red-500 via-red-600 to-pink-600 rounded-3xl p-6 sm:p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-5 h-5 text-white" />
                      <span className="text-white/90 font-medium text-sm uppercase tracking-wider">
                        What's Hot
                      </span>
                    </div>
                    <h1 className="text-white text-3xl sm:text-4xl font-bold mb-2">
                      Music News
                    </h1>
                    <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                      Stay updated with the latest releases, tours, and
                      happenings in the music world
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Updates */}
              {!loading && !error && updates.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <Clock className="w-4 h-4 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">
                      Live Updates
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {updates.map((update) => (
                      <button
                        key={update.id}
                        onClick={() => scrollToNews(update.relatedNewsId)}
                        className="w-full flex items-start gap-3 p-4 bg-white rounded-2xl hover:shadow-md transition-all text-left group"
                      >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm sm:text-base font-medium group-hover:text-red-600 transition-colors">
                            {update.text}
                          </p>
                          <span className="text-xs text-gray-500 mt-0.5 block">
                            {update.time}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-600">Loading news...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* News Feed */}
              {!loading && !error && newsItems.length > 0 && (
                <div className="space-y-6 pb-8">
                  {newsItems.map((item) => (
                    <div
                      key={item._id}
                      id={`news-${item._id}`}
                      className={`bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
                        selectedNews === item._id
                      }`}
                    >
                      {/* Image */}
                      <div className="relative aspect-video sm:aspect-21/9 overflow-hidden">
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {item.category}
                          </span>
                        </div>
                        <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="text-red-600 font-medium">
                            {item.created_at}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                          {item.title}
                        </h3>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                          {item.description}
                        </p>

                        {expandedNews.has(item._id) && (
                          <div className="mb-4 p-4 bg-red-50 rounded-xl">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-5">
                            <button
                              onClick={() => toggleLike(item._id)}
                              className="flex items-center gap-1.5 group"
                            >
                              <Heart
                                className={`w-5 h-5 transition-all ${
                                  likedPosts.has(item._id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400 group-hover:text-red-500"
                                }`}
                              />
                              <span className="text-sm text-gray-600 font-medium">
                                {/* {likedPosts.has(item._id)
                                  ? item.likes + 1
                                  : item.likes} */}
                              </span>
                            </button>

                            <button className="flex items-center gap-1.5 group">
                              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                              <span className="text-sm text-gray-600 font-medium">
                                {item.comments}
                              </span>
                            </button>

                            <button className="flex items-center gap-1.5 group">
                              <Share2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                          </div>

                          <button
                            onClick={() => toggleExpand(item._id)}
                            className="text-red-500 hover:text-red-600 font-medium text-sm"
                          >
                            {expandedNews.has(item._id) ? "Less" : "More"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && newsItems.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No news available</p>
                </div>
              )}

              {/* Load More */}
              <div className="text-center pb-8">
                <button className="bg-white hover:bg-red-50 text-red-600 px-8 py-3 rounded-full font-medium transition-all border border-red-200">
                  Load More
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MusicNewsScreen;