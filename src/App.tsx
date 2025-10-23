// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/themecontext";
import HomeScreen from "./pages/Home";
import LoginScreen from "./pages/login";
import CreateAccountScreen from "./pages/createaccount";
import AlbumGallery from "./pages/Album";
import Landingpage from "./pages/landing_page";
import MusicNewsScreen from "./pages/news";

import Plaques from "./pages/Plaques";
import ProfileScreen from "./pages/Profil";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/create" element={<CreateAccountScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/albums" element={<AlbumGallery />} />
          <Route path="/news" element={<MusicNewsScreen/>} />

          <Route path="/" element={<HomeScreen />} />
          <Route path="/plaques" element={<Plaques />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
