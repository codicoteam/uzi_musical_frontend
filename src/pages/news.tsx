import { useState } from 'react';
import { TrendingUp, Calendar, Clock, Play, Heart, Share2, MessageCircle, Menu, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar';

const MusicNewsScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [selectedNews, setSelectedNews] = useState<number | null>(null);
  const [expandedNews, setExpandedNews] = useState<Set<number>>(new Set());

  const userName = "John Doe";

  const themeClasses = {
    bg: isDarkMode
      ? "bg-gray-900"
      : "bg-gradient-to-br from-white via-red-50 to-red-100",
    card: isDarkMode ? "bg-gray-800/70" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-white/50",
    header: isDarkMode ? "bg-gray-800/80" : "bg-white/80",
  };

  const updates = [
    {
      id: 1,
      type: 'update',
      text: 'Luna Rivers just announced tour dates for Europe!',
      time: '5 min ago',
      relatedNewsId: 1
    },
    {
      id: 2,
      type: 'update',
      text: 'Breaking: New collaboration between The Resonance and DJ Stellar confirmed',
      time: '23 min ago',
      relatedNewsId: 2
    },
    {
      id: 3,
      type: 'update',
      text: '"Summer Nights" music video hits 100M views',
      time: '1 hour ago',
      relatedNewsId: 3
    }
  ];

  const newsItems = [
    {
      id: 1,
      category: 'Album Release',
      title: 'New Album "Midnight Echoes" Drops Next Week',
      artist: 'Luna Rivers',
      description: 'The highly anticipated fifth studio album features 12 tracks blending indie pop with electronic elements.',
      fullContent: 'Luna Rivers has officially announced that her fifth studio album "Midnight Echoes" will be released next week across all major streaming platforms. The album features 12 carefully crafted tracks that showcase her evolution as an artist, blending indie pop sensibilities with cutting-edge electronic production. Collaborating with renowned producers and songwriters, Rivers has created what many are calling her most ambitious work yet. The lead single "Neon Dreams" has already garnered critical acclaim and millions of streams. Pre-orders are now available, and fans who purchase the deluxe edition will receive exclusive behind-the-scenes content and acoustic versions of select tracks.',
      time: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
      likes: 1247,
      comments: 89
    },
    {
      id: 2,
      category: 'Tour Announcement',
      title: 'World Tour 2025: Dates Revealed',
      artist: 'The Resonance',
      description: 'Spanning 40 cities across 5 continents, tickets go on sale this Friday at 10 AM local time.',
      fullContent: 'The Resonance has just unveiled the complete schedule for their highly anticipated World Tour 2025. The extensive tour will span 40 cities across 5 continents, starting in March and concluding in November. This marks the band\'s biggest tour to date, with stops in North America, Europe, Asia, Australia, and South America. Tickets will go on sale this Friday at 10 AM local time through official venues and authorized ticket sellers. VIP packages include meet-and-greet opportunities, exclusive merchandise, and premium seating. The band promises to debut new material from their upcoming album alongside fan favorites from their decade-long career.',
      time: '5 hours ago',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      likes: 3421,
      comments: 234
    },
    {
      id: 3,
      category: 'Trending Now',
      title: 'Viral Hit "Summer Nights" Breaks Records',
      artist: 'Nova & The Stars',
      description: 'The single has reached #1 in 23 countries and accumulated over 500M streams in just two weeks.',
      fullContent: 'Nova & The Stars have achieved unprecedented success with their latest single "Summer Nights," which has shattered multiple streaming records. The track reached #1 in 23 countries simultaneously and has accumulated over 500 million streams in just two weeks since its release. The infectious summer anthem has dominated TikTok with over 2 million user-generated videos and has been featured in numerous playlists worldwide. Music critics praise the song\'s catchy melody and production quality, while fans celebrate its feel-good vibes. The band has announced plans for a special music video featuring fan submissions and celebrity cameos, set to premiere next month.',
      time: '1 day ago',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      likes: 5892,
      comments: 412
    },
    {
      id: 4,
      category: 'Festival Update',
      title: 'Harmony Fest Announces Surprise Headliner',
      artist: 'Various Artists',
      description: 'Mystery artist to close out the festival on Sunday night. Speculation is running wild among fans.',
      fullContent: 'Harmony Fest organizers have sent the music community into a frenzy with the announcement of a surprise headliner for Sunday night\'s closing performance. While the identity remains under wraps, festival directors have dropped cryptic hints on social media, suggesting it\'s an artist who hasn\'t performed live in several years. Industry insiders speculate it could be one of several legendary acts, and ticket sales have surged following the announcement. The three-day festival already features an impressive lineup of over 50 artists across multiple stages. Early bird passes sold out within hours, and remaining tickets are expected to go quickly once the mystery headliner is revealed this week.',
      time: '1 day ago',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
      likes: 2156,
      comments: 567
    }
  ];

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const scrollToNews = (newsId: number) => {
    setSelectedNews(newsId);
    const element = document.getElementById(`news-${newsId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSelectedNews(null), 2000);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedNews(prev => {
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
                <span className={`${themeClasses.text} font-medium`}>Music News</span>
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
          <AnimatePresence mode="wait">
            <motion.div
              key="music-news"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-8"
            >
              {/* Live Updates Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">Live Updates</h2>
                </div>
                <div className="space-y-3">
                  {updates.map((update) => (
                    <button
                      key={update.id}
                      onClick={() => scrollToNews(update.relatedNewsId)}
                      className="w-full flex items-start space-x-3 p-3 hover:bg-red-50 rounded-lg transition-all text-left cursor-pointer group"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium group-hover:text-red-600 transition-colors">{update.text}</p>
                        <span className="text-xs text-gray-500">{update.time}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-red-500 text-sm">View →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Banner */}
              <div className="bg-linear-to-r from-red-500 to-red-600 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm uppercase tracking-wide">Trending Now</span>
                </div>
                <h2 className="text-white text-2xl font-bold mb-2">Top Stories in Music Today</h2>
                <p className="text-red-100">Discover the hottest news, releases, and updates from your favorite artists</p>
              </div>

              {/* News Grid */}
              <div className="space-y-6">
                {newsItems.map((item) => (
                  <div 
                    key={item.id}
                    id={`news-${item.id}`}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                      selectedNews === item.id ? 'ring-4 ring-red-400' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="md:w-1/3 relative overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            {item.category}
                          </span>
                        </div>
                        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                          <Play className="w-5 h-5 text-red-500" />
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{item.time}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm font-medium text-red-600">{item.artist}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Expanded Content */}
                        {expandedNews.has(item.id) && (
                          <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <p className="text-gray-700 leading-relaxed">
                              {item.fullContent}
                            </p>
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-6">
                            <button 
                              onClick={() => toggleLike(item.id)}
                              className="flex items-center space-x-2 group/like transition-all"
                            >
                              <Heart 
                                className={`w-5 h-5 transition-all ${
                                  likedPosts.has(item.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-400 group-hover/like:text-red-500'
                                }`}
                              />
                              <span className="text-sm text-gray-600">
                                {likedPosts.has(item.id) ? item.likes + 1 : item.likes}
                              </span>
                            </button>

                            <button className="flex items-center space-x-2 group/comment">
                              <MessageCircle className="w-5 h-5 text-gray-400 group-hover/comment:text-red-500 transition-colors" />
                              <span className="text-sm text-gray-600">{item.comments}</span>
                            </button>

                            <button className="flex items-center space-x-2 group/share">
                              <Share2 className="w-5 h-5 text-gray-400 group-hover/share:text-red-500 transition-colors" />
                              <span className="text-sm text-gray-600">Share</span>
                            </button>
                          </div>

                          <button 
                            onClick={() => toggleExpand(item.id)}
                            className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                          >
                            {expandedNews.has(item.id) ? 'Show Less ↑' : 'Read More →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center">
                <button className="bg-white hover:bg-red-50 text-red-600 px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg border-2 border-red-200">
                  Load More Stories
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