"use client";
import Image from "next/image";
import styles from "./styles/page.module.css";
import flower from "./svg/flower.svg";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import About from "./components/About";
import MusicPlayer from "./components/MusicPlayer";
import Email from "./components/Email";
import Stamp from "./components/Stamp";
import FluidBackground from "./components/fluid/Fluid";
import ImageGallery from "./components/ImageGallery";
import BrushCanvas from "./components/BrushCanvas";
import Marquee from "./components/Marquee";
import { useGlobalState } from "./context/GlobalStateContext";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const {
    showAbout,
    isTransitioning,
    setIsTransitioning,
    isRotating,
    setIsRotating,
  } = useGlobalState();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsRotating(true);
    setIsTransitioning(true);

    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setIsTransitioning(false);
    }, 300);

    setTimeout(() => {
      setIsRotating(false);
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <FluidBackground />
      <main className={styles.main}>
        {showAbout && (
          <div
            className={`
              ${styles.flowerContainer} 
              ${isTransitioning ? styles.transitioning : ""} 
              ${isRotating ? styles.rotating : ""}
            `}
            onClick={toggleTheme}
          >
            <Image src={flower} alt="Flower" width={88} height={88} />
            <span className={styles.flowerLabel}>theme</span>
          </div>
        )}
        {/* <Marquee /> */}
        <About />
        <MusicPlayer />
        <Email />
        <Stamp />
        <ImageGallery />
        <BrushCanvas />
      </main>
    </div>
  );
}
