import { X } from "lucide-react";
import { useState } from "react";
import PaymentModal from "./payment";

interface Album {
  id: number;
  name: string;
  artist: string;
  genre: string;
  description: string;
  tracks: number;
  image: string;
  color: string;
}

interface AlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const AlbumModal = ({
  album,
  isOpen,
  onClose,
  isDarkMode = false,
}: AlbumModalProps) => {
  if (!isOpen || !album) return null;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(456);

  const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-slate-600",
    border: isDarkMode ? "border-gray-700" : "border-slate-200",
  };

  // Mock track data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl ${themeClasses.bg} shadow-2xl animate-slideUp`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-200"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Album Cover */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <img
                  src={album.image}
                  alt={album.name}
                  className="w-full aspect-square rounded-xl shadow-2xl"
                />
                <div>
                  <h2 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
                    {album.name}
                  </h2>
                  <p className={`text-lg ${themeClasses.textSecondary} mb-2`}>
                    {album.artist}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Contributing Artist:
                      </span>
                      <span className={themeClasses.text}>{album.artist}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Track Count:
                      </span>
                      <span className={themeClasses.text}>{album.tracks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Duration:
                      </span>
                      <span className={themeClasses.text}>
                        1 Hr 12 Mins 15 Sec
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>
                        Album Affiliation:
                      </span>
                      <span className={themeClasses.text}>Music Label</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Track Details */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-1`}>
                  Track 01 of {album.tracks}
                </h3>
                <p className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
                  {album.name}
                </p>
                <p
                  className={`text-sm ${themeClasses.textSecondary} leading-relaxed mb-6`}
                >
                  {album.description}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <h4 className={`font-bold ${themeClasses.text} text-center mb-3`}>
                  Song Credits
                </h4>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>Produced By:</span>
                  <span className={themeClasses.text}>Producer Name</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>Mastered By:</span>
                  <span className={themeClasses.text}>Master Engineer</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>Written By:</span>
                  <span className={themeClasses.text}>Songwriter</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>Featuring:</span>
                  <span className={themeClasses.text}>Featured Artist</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>
                    Backing Vocals:
                  </span>
                  <span className={themeClasses.text}>Vocal Artists</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>
                    Instrumentalists:
                  </span>
                  <span className={themeClasses.text}>Musicians</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>Duration:</span>
                  <span className={themeClasses.text}>3 mins 45 Sec</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>
                    Special Credits:
                  </span>
                  <span className={themeClasses.text}>Special Thanks</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.textSecondary}>
                    Release Date:
                  </span>
                  <span className={themeClasses.text}>24 November 2024</span>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        album.color.includes("purple")
                          ? "bg-purple-500"
                          : album.color.includes("blue")
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Album Performance */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <img
                  src={album.image}
                  alt="Album Award"
                  className="w-full aspect-square rounded-xl shadow-2xl"
                />
                <div>
                  <h3
                    className={`text-2xl font-bold ${themeClasses.text} text-center mb-4`}
                  >
                    Album Performance
                  </h3>
                  <div className="space-y-3 text-sm">
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Slider and Support Button */}
          <div className={`border-t ${themeClasses.border} p-6 space-y-4`}>
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
              <span className="text-2xl font-bold text-green-500 min-w-[80px] text-right">
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
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            albumName={album.name}
            albumArtist={album.artist}
            albumImage={album.image}
            supportAmount={selectedAmount}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AlbumModal;