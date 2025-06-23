import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import React from "react";
import Card from "@mui/material/Card";
import ActionAreaCard from "../components/Card";


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Card />
      <div className="flex-grow" />
      <Footer />
    </div>
  );
}
