
import { Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
const HomePage = lazy(() => import("./pages/Homepage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const InicioUsuario = lazy(() => import("./pages/paginaUsuario"));
const AlumnosPage = lazy(() => import("./pages/AlumnosPage"));
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

function App() {
  return (
    <div className="App">
      <Suspense fallback={<Loader />}> 
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
      </Suspense>
    </div>
  );
}

export default App;