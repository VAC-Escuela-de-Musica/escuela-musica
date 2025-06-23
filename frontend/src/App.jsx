import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import React from "react";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;