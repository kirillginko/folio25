"use client";

import { useEffect, useState, useMemo } from "react";
import { letterImages } from "../data/letters";
import styles from "../styles/fallingLetters.module.css";
import Image from "next/image";

const FallingLetters = () => {
  const [letters, setLetters] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload all images on mount
  useEffect(() => {
    // Skip preloading, just mark as ready immediately
    setImagesPreloaded(true);

    // Preload in background without blocking
    letterImages.forEach((letterImg) => {
      try {
        const img = new window.Image();
        img.src = letterImg.image;
      } catch {
        // Silently ignore errors
      }
    });
  }, []);

  useEffect(() => {
    if (!imagesPreloaded) return;

    const initialDelay = setTimeout(() => {
      setIsActive(true);
      setHasStarted(true);
    }, 15000);

    return () => clearTimeout(initialDelay);
  }, [imagesPreloaded]);

  useEffect(() => {
    if (!hasStarted) return;

    const createLetter = () => {
      const randomLetter =
        letterImages[Math.floor(Math.random() * letterImages.length)];
      const left = Math.random() * 100;
      const animationDuration = 8 + Math.random() * 7;
      const size = 50 + Math.random() * 150;

      return {
        id: Math.random(),
        letter: randomLetter.letter,
        image: randomLetter.image,
        createdAt: Date.now(),
        style: {
          left: `${left}%`,
          animationDuration: `${animationDuration}s`,
          width: `${size}px`,
          height: `${size}px`,
        },
      };
    };

    const addLetter = () => {
      if (!isActive || isTransitioning) return;

      setLetters((prevLetters) => {
        const now = Date.now();
        const filteredLetters = prevLetters.filter((letter) => {
          const duration = parseFloat(letter.style.animationDuration) * 1000;
          return now - letter.createdAt < duration;
        });

        if (filteredLetters.length < 15) {
          return [...filteredLetters, createLetter()];
        }
        return filteredLetters;
      });
    };

    const checkLetters = () => {
      const now = Date.now();
      setLetters((prevLetters) => {
        const remainingLetters = prevLetters.filter((letter) => {
          const duration = parseFloat(letter.style.animationDuration) * 1000;
          return now - letter.createdAt < duration;
        });

        if (isTransitioning && remainingLetters.length === 0) {
          setIsTransitioning(false);
          setIsActive(false);
        }

        return remainingLetters;
      });
    };

    const letterInterval = setInterval(addLetter, 1000);
    const checkInterval = setInterval(checkLetters, 1000);

    const toggleInterval = setInterval(() => {
      if (isActive && !isTransitioning) {
        setIsTransitioning(true);
      } else if (!isActive && !isTransitioning) {
        setIsActive(true);
      }
    }, 15000);

    return () => {
      clearInterval(letterInterval);
      clearInterval(checkInterval);
      clearInterval(toggleInterval);
    };
  }, [isActive, isTransitioning, hasStarted]);

  return (
    <div className={styles.container}>
      {letters.map((letter) => (
        <div key={letter.id} className={styles.letter} style={letter.style}>
          <Image
            src={letter.image}
            alt={letter.letter}
            width={200}
            height={200}
            unoptimized
            loading="eager"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FallingLetters;
