'use client';
import { useState } from "react";
import FloatingGlassMorphNavbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import LoginModal from "../components/LoginModal";
import Loader from "../components/LoaderComponent";
import { useAuth } from "../context/authContext";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const { loading } = useAuth(); // get loading from context

  if (loading) return <Loader />; // show loader until auth check finishes

  return (
    <>
      <FloatingGlassMorphNavbar openLogin={() => setLoginOpen(true)} />
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
      <HeroSection />
    </>
  );
}
