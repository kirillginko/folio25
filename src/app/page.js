"use client";
import Image from "next/image";
import styles from "./styles/page.module.css";
import flower from "./svg/flower.svg";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { useGlobalState } from "./context/GlobalStateContext";

// Critical components - load immediately
import FallingText from "./components/FallingText";
import FluidBackground from "./components/fluid/Fluid";

// Lazy load non-critical components
const About = dynamic(() => import("./components/About"), { ssr: false });
const MusicPlayer = dynamic(() => import("./components/MusicPlayer"), {
  ssr: false,
});
const Email = dynamic(() => import("./components/Email"), { ssr: false });
const Stamp = dynamic(() => import("./components/Stamp"), { ssr: false });
const ImageGallery = dynamic(() => import("./components/ImageGallery"), {
  ssr: false,
});
const BrushCanvas = dynamic(() => import("./components/BrushCanvas"), {
  ssr: false,
});
const AnalogClock = dynamic(() => import("./components/AnalogClock"), {
  ssr: false,
});
const FallingLetters = dynamic(() => import("./components/FallingLetters"), {
  ssr: false,
});

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [componentsReady, setComponentsReady] = useState(false);
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
    setMounted(true);
    // Always set theme to dark on mount, never use system theme
    if (!theme || theme === "system") {
      setTheme("dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const toggleTheme = () => {
    console.log('Toggle clicked, mounted:', mounted, 'current theme:', theme);
    if (!mounted) {
      console.log('Not mounted, returning');
      return;
    }

    setIsRotating(true);
    setIsTransitioning(true);

    // Use functional update to avoid stale closure
    setTheme((currentTheme) => {
      // Handle system theme edge case
      if (currentTheme === "system") {
        console.log('System theme detected, switching to light');
        return "light";
      }
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      console.log('Changing theme from', currentTheme, 'to', newTheme);
      return newTheme;
    });

    setTimeout(() => {
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

          // Progressive component loading for better performance
          requestAnimationFrame(() => {
            setComponentsReady(true);
          });

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

              // Stagger fade-in only for non-draggable components
              const nonDraggableElements = Array.from(
                mainContentRef.current.children
              ).filter((child) => {
                // Exclude components that have their own fade-in animation
                const className = child.className || "";
                return (
                  !className.includes("draggableWrapper") &&
                  !className.includes("musicPlayerWrapper")
                );
              });

              gsap.fromTo(
                nonDraggableElements,
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
                  clearProps: "opacity,y",
                }
              );
            }
          }, 300); // Reduced delay for faster perceived performance
        },
      });
    }, 1500); // Reduced initial delay
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
          {componentsReady && <FallingLetters />}
          {showThemeSelector && (
            <div
              className={`
                ${styles.flowerContainer}
                ${isTransitioning ? styles.transitioning : ""}
                ${isRotating ? styles.rotating : ""}
              `}
              onClick={toggleTheme}
            >
              <Image
                src={flower}
                alt="Flower"
                width={88}
                height={88}
                priority
              />
              <span className={styles.flowerLabel}>theme</span>
            </div>
          )}
          {componentsReady && (
            <>
              <About />
              <AnalogClock />
              <MusicPlayer />
              <Email />
              <Stamp />
              <ImageGallery />
              <BrushCanvas />
            </>
          )}
        </main>
      )}
    </div>
  );
}
