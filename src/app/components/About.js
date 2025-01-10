"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/about.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";

const About = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const draggableInstance = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const createDraggable = () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

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
    };

    createDraggable();

    // Add resize handler
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Check if the component is outside the viewport
        if (rect.right > windowWidth) {
          gsap.to(containerRef.current, {
            x: windowWidth - rect.width - 20, // 20px padding from edge
            duration: 0.3,
          });
        }
        if (rect.bottom > windowHeight) {
          gsap.to(containerRef.current, {
            y: windowHeight - rect.height - 20,
            duration: 0.3,
          });
        }
        if (rect.left < 0) {
          gsap.to(containerRef.current, {
            x: 20, // 20px padding from left edge
            duration: 0.3,
          });
        }
        if (rect.top < 0) {
          gsap.to(containerRef.current, {
            y: 20,
            duration: 0.3,
          });
        }
      }
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isMinimized]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={styles.draggableWrapper}>
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
