import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import React from "react";
import Navbar from "./components/Navbar";
import InicioUsuario from "./pages/paginaUsuario";
import AlumnosPage from "./pages/AlumnosPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/usuario" element={<InicioUsuario />} />
        <Route path="/alumnos" element={<AlumnosPage />} />
        {/* agregar más rutas */}
      </Routes>
    </div>
  );
}

export default App;