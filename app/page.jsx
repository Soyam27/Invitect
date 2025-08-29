'use client';
import { useState } from "react";
import FloatingGlassMorphNavbar from "../components/navbar";
import HeroSection from "../components/HeroSection";
import LoginModal from "../components/LoginModal";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <FloatingGlassMorphNavbar openLogin={() => setLoginOpen(true)} />
      
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
      <HeroSection />
    </>
  );
}
