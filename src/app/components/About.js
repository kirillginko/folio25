"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/about.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import {
  BsArrowsAngleExpand,
  BsArrowsAngleContract,
  BsInfoCircleFill,
} from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import { useGlobalState } from "../context/GlobalStateContext";
import { HiOutlineUserCircle } from "react-icons/hi";

const About = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const draggableInstance = useRef(null);
  const {
    showAbout,
    setShowBackdrop,
    setActiveComponent,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
    setShowThemeButton,
    setShowWorkButton,
  } = useGlobalState();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const createDraggable = () => {
    if (containerRef.current) {
      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: isMinimized ? 0.95 : 0.85,
        dragResistance: isMinimized ? 0.2 : 0.15,
        zIndexBoost: true,
        onDragStart: function () {
          gsap.to(this.target, {
            scale: isMinimized ? 1.05 : 1.02,
            duration: 0.2,
          });
        },
        onDragEnd: function () {
          gsap.to(this.target, { scale: 1, duration: 0.2 });
        },
      })[0];
    }
  };

  useEffect(() => {
    // Add mobile check - ensure this is exactly the same as in BrushCanvas
    const checkMobile = () => {
      const mobileDetected = window.innerWidth <= 768;
      console.log("About mobile check:", mobileDetected);
      setIsMobile(mobileDetected);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Enable draggable when minimized, disable when expanded on mobile
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

    // Clean up
    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMinimized, isMobile]);

  useEffect(() => {
    const adjustPositionAndSize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Common animation config
        const animConfig = {
          duration: 0.15,
          ease: "power2.out",
        };

        if (isMobile && !isMinimized) {
          gsap.to(containerRef.current, {
            x: 0,
            y: 0,
            ...animConfig,
          });

          gsap.to(containerRef.current.children[1], {
            width: `${viewportWidth * 0.9}px`,
            height: `${viewportHeight * 0.8}px`,
            borderRadius: "16px",
            ...animConfig,
          });
        } else {
          const element = containerRef.current.getBoundingClientRect();
          let newX =
            gsap.getProperty(containerRef.current, "x") ||
            (viewportWidth - element.width) / 2;
          let newY =
            gsap.getProperty(containerRef.current, "y") ||
            (viewportHeight - element.height) / 2;

          newX = Math.max(
            20,
            Math.min(newX, viewportWidth - element.width - 20)
          );
          newY = Math.max(
            20,
            Math.min(newY, viewportHeight - element.height - 20)
          );

          gsap.to(containerRef.current, {
            x: newX,
            y: newY,
            ...animConfig,
          });

          gsap.to(containerRef.current.children[1], {
            width: isMinimized ? "80px" : "320px",
            height: isMinimized ? "80px" : "400px",
            borderRadius: isMinimized ? "20%" : "16px",
            ...animConfig,
          });
        }
      }
    };

    // Initial adjustment
    setTimeout(adjustPositionAndSize, 100);

    // Add resize listener with consistent debounce
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(adjustPositionAndSize, 100);
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMinimized, isMobile]);

  const toggleMinimized = () => {
    if (!isMinimized) {
      // When minimizing, hide the backdrop
      setShowBackdrop(false);
      setActiveComponent(null);
    } else if (isMobile) {
      // When expanding on mobile, show the backdrop
      setShowBackdrop(true);
      setActiveComponent("about");
    }

    setIsMinimized((prev) => !prev);
  };

  return (
    <div style={{ display: showAbout ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={styles.draggableWrapper}
        style={{
          ...(isMobile &&
            !isMinimized && {
              position: "fixed",
              top: "10%",
              left: "5%",
              width: "90vw",
              maxWidth: "100%",
              zIndex: 10000 /* Higher than backdrop */,
            }),
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
          {/* Minimized State */}
          {isMinimized ? (
            <div className={styles.minimizedContent}>
              <ImInfo className={styles.minimizedText} />
            </div>
          ) : (
            <>
              {/* Header Section */}
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
              {/* Bio Section */}
              <section className={styles.bioSection}>
                <h2 className={styles.bioTitle}>About Me</h2>
                <p className={styles.bioText}>
                  I am a <strong>full-stack creative web developer</strong> with
                  a passion for crafting{" "}
                  <strong>interactive, user-centric digital experiences</strong>
                  . My expertise spans from front-end development to back-end
                  systems, combining technical skill with artistic vision to
                  build webpages that are both functional and visually engaging.
                  I specialize in using cutting-edge tools like{" "}
                  <strong>React</strong>, <strong>GSAP</strong>, and{" "}
                  <strong>Next.js</strong> to bring ideas to life.
                </p>
                <p className={styles.bioText}>
                  I am a <strong>full-stack creative web developer</strong> with
                  a passion for crafting{" "}
                  <strong>interactive, user-centric digital experiences</strong>
                  .
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
