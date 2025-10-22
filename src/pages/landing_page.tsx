import { Music } from "lucide-react";
import { useState, useEffect } from "react";

const Landingpage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    "https://img.freepik.com/free-photo/people-music_273609-25463.jpg",
    "https://t3.ftcdn.net/jpg/03/28/89/42/360_F_328894297_UEWkHrtVSHrqVXz87nuwRQXxovU1AOsU.jpg",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&q=80",
  ];

  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <div
        className="absolute inset-0 z-0 transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 38, 38, 0.08), transparent)`,
        }}
      ></div>

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-black/60 to-black/50 z-50"></div>
        {backgroundImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-opacity duration-2000 ${
              index === currentImageIndex ? "opacity-50" : ""
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 sm:px-8 py-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50 group-hover:shadow-red-600/80 transition-all duration-300 group-hover:scale-110">
              <Music
                className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-widest bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              UZINDUZI
            </span>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <button
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-white border border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
            <button className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-linear-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium hover:scale-105 shadow-lg shadow-red-600/50 hover:shadow-red-600/80">
              Sign up
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-4xl w-full text-center">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight bg-linear-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              Master your track,
              <br />
              <span className="bg-linear-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                instantly.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm px-4">
              An online mastering engine that's easy to use, fast, and sounds
              incredible. Made by Grammy winning engineers.
            </p>

            <button
              onClick={() => (window.location.href = "/signup")}
              className="group inline-flex items-center gap-3 sm:gap-4 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 sm:px-12 py-5 sm:py-6 rounded-full transition-all duration-300 shadow-2xl shadow-red-600/50 hover:shadow-red-600/80 hover:scale-105 relative overflow-hidden text-lg sm:text-xl font-medium"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Get Started</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </main>

        <div className="absolute bottom-8 left-8 hidden lg:block">
          <p className="text-sm text-gray-400 transform -rotate-90 origin-left whitespace-nowrap tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity duration-300">
            Here is the difference
          </p>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 flex gap-3 sm:gap-4">
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-linear-to-br hover:from-red-600/30 hover:to-red-800/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 border border-white/10 hover:border-red-500/50">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </button>
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-linear-to-br hover:from-red-600/30 hover:to-red-800/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 border border-white/10 hover:border-red-500/50">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landingpage;
