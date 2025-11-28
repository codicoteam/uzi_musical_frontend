// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/themecontext";
import HomeScreen from "./pages/Home";
import LoginScreen from "./pages/login";
import CreateAccountScreen from "./pages/createaccount";
import AlbumGallery from "./pages/Album";
import Landingpage from "./pages/landing_page";
import MusicNewsScreen from "./pages/news";
import MusicActivitiesScreen from "./pages/Activities";
import AlbumDetailScreen from "./pages/Albumdetail";
import AlbumPage from "./pages/viewalbum";
import AllAlbumsScreen from "./pages/All_Albums";
import Plaques from "./pages/Plaques";
import ProfileScreen from "./pages/Profil";
import Errorpage from "./pages/error";
import VerifyEmailScreen from "./pages/verify_email";

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
          <Route path="/albums/:albumId" element={<AlbumDetailScreen />} />
          <Route path="/all_albums" element={<AllAlbumsScreen />} />
          <Route path="/news" element={<MusicNewsScreen />} />
          <Route path="/activities" element={<MusicActivitiesScreen />} />
          <Route path="/view" element={<AlbumPage />} />
          <Route path="/verify-email" element={<VerifyEmailScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/plaques" element={<Plaques />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/*" element={<Errorpage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
