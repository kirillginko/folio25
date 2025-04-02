"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/about.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import { useGlobalState } from "../context/GlobalStateContext";

const About = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const draggableInstance = useRef(null);
  const { showAbout, setShowBackdrop, setActiveComponent } = useGlobalState();

  const createDraggable = () => {
    if (containerRef.current) {
      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: 0.95,
        dragResistance: 0.2,
      })[0];
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (isMinimized || !isMobile) {
      gsap.registerPlugin(Draggable);
      createDraggable();

      // Set initial position if not already set
      if (
        !gsap.getProperty(containerRef.current, "x") &&
        !gsap.getProperty(containerRef.current, "y")
      ) {
        gsap.set(containerRef.current, {
          x: 100,
          y: 100,
        });
      }
    } else if (draggableInstance.current) {
      draggableInstance.current.kill();
    }

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMinimized, isMobile]);

  // Add viewport boundary handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const element = containerRef.current.getBoundingClientRect();
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        // Calculate boundaries
        const maxX = viewportWidth - element.width - 20;
        const maxY = viewportHeight - element.height - 20;

        // Adjust position if out of bounds
        if (
          currentX < 20 ||
          currentX > maxX ||
          currentY < 20 ||
          currentY > maxY
        ) {
          const newX = Math.max(20, Math.min(currentX, maxX));
          const newY = Math.max(20, Math.min(currentY, maxY));

          gsap.to(containerRef.current, {
            x: newX,
            y: newY,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMinimized = () => {
    if (!isMinimized) {
      setShowBackdrop(false);
      setActiveComponent(null);
    } else if (isMobile) {
      setShowBackdrop(true);
      setActiveComponent("about");
    }
    setIsMinimized((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={styles.draggableWrapper}
      style={{
        display: showAbout ? "block" : "none",
      }}
    >
      <div
        className={`${styles.greenCircle} about-toggle-button`}
        onClick={toggleMinimized}
      >
        {isMinimized ? (
          <BsArrowsAngleExpand className={styles.toggleIcon} />
        ) : (
          <BsArrowsAngleContract className={styles.toggleIcon} />
        )}
      </div>

      <div
        className={`${styles.designContainer} ${
          isMinimized ? styles.minimizedContainer : styles.normalContainer
        }`}
      >
        {isMinimized ? (
          <div className={styles.minimizedContent}>
            <ImInfo className={styles.minimizedText} />
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <div className={styles.headerContent}>
                <p>*** Kirill@Kirill.Agency ***</p>
              </div>
            </header>
            <div className={styles.imageWrapper}>
              <Image
                src="https://res.cloudinary.com/dtps5ugbf/image/upload/c_crop,ar_1:1/v1736362617/ascii-art_n8ttiz.png"
                alt="ASCII Art"
                width={600}
                height={600}
                priority
                className={styles.heroImage}
              />
            </div>
            <section className={styles.bioSection}>
              <h2 className={styles.bioTitle}>About Me</h2>
              <p className={styles.bioText}>
                I am a <strong>full-stack creative web developer</strong> with a
                passion for crafting{" "}
                <strong>interactive, user-centric digital experiences</strong>.
                My expertise spans from front-end development to back-end
                systems, combining technical skill with artistic vision to build
                webpages that are both functional and visually engaging. I
                specialize in using cutting-edge tools like{" "}
                <strong>React</strong>, <strong>GSAP</strong>, and{" "}
                <strong>Next.js</strong> to bring ideas to life.
              </p>
              <p className={styles.bioText}>
                I am a <strong>full-stack creative web developer</strong> with a
                passion for crafting{" "}
                <strong>interactive, user-centric digital experiences</strong>.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default About;
