"use client";
import Image from "next/image";
import styles from "./styles/page.module.css";
import flower from "./svg/flower.svg";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import About from "./components/About";
import MusicPlayer from "./components/MusicPlayer";
import Stamp from "./components/Stamp";
import FluidBackground from "./components/fluid/Fluid";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

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

    // Reset rotation after animation completes
    setTimeout(() => {
      setIsRotating(false);
    }, 500); // Match this with animation duration
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <FluidBackground />
      <main className={styles.main}>
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
        <About />
        <MusicPlayer />
        <Stamp />
      </main>
    </div>
  );
}
