"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/about.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

const About = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
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
        bounds: {
          top: -50,
          left: -50,
          width: window.innerWidth + 100,
          height: window.innerHeight + 50,
        },
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: isMinimized ? 0.85 : 0.65,
        dragResistance: isMinimized ? 0.1 : 0.05,
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

    const updateDraggableBounds = () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
        createDraggable();
      }
    };

    window.addEventListener("resize", updateDraggableBounds);

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", updateDraggableBounds);
    };
  }, [isMinimized]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={styles.draggableWrapper}>
      {/* Green Circle - Now outside the design container but inside draggable wrapper */}
      <div className={styles.greenCircle} onClick={toggleMinimized}></div>

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
                <p>*** Kirill@Kirill.Studio ***</p>
              </div>
            </header>

            {/* Bio Section */}
            <section className={styles.bioSection}>
              <h2 className={styles.bioTitle}>About Me</h2>
              <p className={styles.bioText}>
                I am a <strong>full-stack creative web developer</strong> with a
                passion for crafting{" "}
                <strong> interactive, user-centric digital experiences</strong>.
                My expertise spans from front-end development to back-end
                systems, combining technical skill with artistic vision to build
                webpages that are both functional and visually engaging. I
                specialize in using cutting-edge tools like{" "}
                <strong>React</strong>, <strong>GSAP</strong>, and{" "}
                <strong>Next.js</strong> to bring ideas to life.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default About;
