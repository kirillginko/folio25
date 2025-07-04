"use client";
import Image from "next/image";
import styles from "./styles/page.module.css";
import flower from "./svg/flower.svg";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import About from "./components/About";
import MusicPlayer from "./components/MusicPlayer";
import Email from "./components/Email";
import Stamp from "./components/Stamp";
import FluidBackground from "./components/fluid/Fluid";
import ImageGallery from "./components/ImageGallery";
import BrushCanvas from "./components/BrushCanvas";
import FallingText from "./components/FallingText";
import AnalogClock from "./components/AnalogClock";
import { useGlobalState } from "./context/GlobalStateContext";
import FallingLetters from "./components/FallingLetters";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingContainerRef = useRef(null);
  const mainContentRef = useRef(null);
  const fluidBackgroundRef = useRef(null);

  const {
    showThemeSelector,
    isTransitioning,
    setIsTransitioning,
    isRotating,
    setIsRotating,
  } = useGlobalState();

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (!theme) {
        setTheme("dark");
      }
    }
  }, [theme, setTheme, mounted]);

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

  const handleLoadingComplete = () => {
    // First, transition the fluid background if we're in light theme
    if (theme === "light") {
      gsap.to(fluidBackgroundRef.current, {
        backgroundColor: "#000000",
        duration: 1,
        ease: "power2.inOut",
      });
    }

    // Add a longer delay before starting the transition
    setTimeout(() => {
      // Fade out loading container
      gsap.to(loadingContainerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          setLoading(false);

          // Add delay before fading in main content
          setTimeout(() => {
            if (mainContentRef.current) {
              // Fade in main content
              gsap.fromTo(
                mainContentRef.current,
                {
                  opacity: 0,
                  visibility: "visible",
                  pointerEvents: "auto",
                },
                {
                  opacity: 1,
                  duration: 1.5,
                  ease: "power2.inOut",
                }
              );

              // Stagger fade-in for child components
              const nonInteractiveElements = Array.from(
                mainContentRef.current.children
              ).filter(
                (child) => !child.classList.contains("interactive-element")
              );

              gsap.fromTo(
                nonInteractiveElements,
                {
                  opacity: 0,
                  y: 20,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  stagger: 0.1,
                  ease: "power2.out",
                  clearProps: "all",
                }
              );
            }
          }, 1500); // 1.5 second delay before showing main content
        },
      });
    }, 2000); // Increased to 2 seconds delay before starting transition
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <FluidBackground ref={fluidBackgroundRef} />
      {loading ? (
        <div ref={loadingContainerRef} className={styles.loadingContainer}>
          <FallingText onComplete={handleLoadingComplete} />
        </div>
      ) : (
        <main
          ref={mainContentRef}
          className={styles.main}
          style={{ opacity: 0 }}
        >
          <FallingLetters />
          {showThemeSelector && (
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
          <About />
          <AnalogClock />
          <MusicPlayer />
          <Email />
          <Stamp />
          <div className="interactive-element">
            <ImageGallery />
          </div>
          <BrushCanvas />
        </main>
      )}
    </div>
  );
}
