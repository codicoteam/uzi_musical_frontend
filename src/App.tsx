// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/themecontext";
import HomeScreen from "./pages/Home";


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
