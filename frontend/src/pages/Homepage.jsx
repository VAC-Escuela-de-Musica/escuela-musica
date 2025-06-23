import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import React from "react";


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <div className="flex-grow" />
      <Footer />
    </div>
  );
}
