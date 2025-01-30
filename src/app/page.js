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
import { useGlobalState } from "./context/GlobalStateContext";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingContainerRef = useRef(null);
  const mainContentRef = useRef(null);
  const fluidBackgroundRef = useRef(null);

  const {
    showAbout,
    isTransitioning,
    setIsTransitioning,
    isRotating,
    setIsRotating,
  } = useGlobalState();

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (!theme) {
        setTheme("light");
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 20000);

    return () => clearTimeout(timer);
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

    // Fade out loading container
    gsap.to(loadingContainerRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setLoading(false);

        requestAnimationFrame(() => {
          if (mainContentRef.current) {
            // Fade in main content
            gsap.fromTo(
              mainContentRef.current,
              {
                opacity: 0,
                visibility: "visible",
                pointerEvents: "auto", // Ensure interactions work
              },
              {
                opacity: 1,
                duration: 1.5,
                ease: "power2.inOut",
              }
            );

            // Stagger fade-in for child components
            // Use a different selector that excludes interactive elements
            const nonInteractiveElements = Array.from(
              mainContentRef.current.children
            ).filter(
              (child) => !child.classList.contains("interactive-element")
            ); // Add this class to elements that should maintain interaction

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
                clearProps: "all", // Clear GSAP-added properties after animation
              }
            );
          }
        });
      },
    });
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      {loading ? (
        <div ref={loadingContainerRef} className={styles.loadingContainer}>
          <FallingText onComplete={handleLoadingComplete} />
          <FluidBackground ref={fluidBackgroundRef} />
        </div>
      ) : (
        <>
          <FluidBackground ref={fluidBackgroundRef} />
          <main
            ref={mainContentRef}
            className={styles.main}
            style={{ opacity: 0 }}
          >
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
            <About />
            <MusicPlayer />
            <Email />
            <Stamp />
            <div className="interactive-element">
              <ImageGallery />
            </div>
            <BrushCanvas />
          </main>
        </>
      )}
    </div>
  );
}
