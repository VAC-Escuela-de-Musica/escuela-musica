
import React from "react";
import "../App.css";

const Loader = () => {
  return (
    <div className="custom-loader-bg">
      <div className="custom-loader-title">Escuela de Música</div>
      <div className="custom-loader-logo-wrapper">
        <img src="/logo_blanco.svg" alt="Logo" className="custom-loader-logo" />
        <div className="custom-loader-particles">
          <span className="particle" style={{ top: '18%', left: '30%' }}></span>
          <span className="particle" style={{ top: '60%', left: '70%' }}></span>
          <span className="particle" style={{ top: '40%', left: '80%' }}></span>
          <span className="particle" style={{ top: '75%', left: '40%' }}></span>
          <span className="particle" style={{ top: '25%', left: '60%' }}></span>
        </div>
      </div>
      <div className="custom-loader-text">
        <span>C</span>
        <span>a</span>
        <span>r</span>
        <span>g</span>
        <span>a</span>
        <span>n</span>
        <span>d</span>
        <span>o</span>
        <span className="custom-loader-dot">.</span>
        <span className="custom-loader-dot">.</span>
        <span className="custom-loader-dot">.</span>
      </div>
    </div>
  );
};

export default Loader;
