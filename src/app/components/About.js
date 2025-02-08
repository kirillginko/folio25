"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/about.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";

const About = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const draggableInstance = useRef(null);
  const { showAbout } = useGlobalState();

  const createDraggable = () => {
    if (containerRef.current) {
      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: "body",
        inertia: true,
      })[0];
    }
  };

  useEffect(() => {
    // Add mobile check
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Enable draggable when minimized, disable when expanded on mobile
    if (isMinimized || !isMobile) {
      gsap.registerPlugin(Draggable);
      createDraggable();
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

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.draggableWrapper} ${
        isMobile && !isMinimized ? styles.mobileFixed : ""
      }`}
      style={{
        display: showAbout ? "block" : "none",
        ...(!(isMobile && !isMinimized) && {
          position: "fixed",
          top: "50%",
          right: "50%",
          transform: "translate(50%, -50%)",
        }),
      }}
    >
      <div className={styles.greenCircle} onClick={toggleMinimized}>
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
            <span className={styles.minimizedDots}>About</span>
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
