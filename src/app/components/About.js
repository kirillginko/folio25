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
  const draggableInstance = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const positionSaved = useRef(false);
  const isInitialPositionSet = useRef(false);
  const { showAbout, setShowBackdrop, setActiveComponent, activeComponent } =
    useGlobalState();

  const createDraggable = () => {
    if (!containerRef.current) return;

    if (draggableInstance.current) {
      draggableInstance.current.kill();
    }

    draggableInstance.current = Draggable.create(containerRef.current, {
      type: "x,y",
      bounds: "body",
      inertia: true,
      cursor: "grab",
      activeCursor: "grabbing",
      edgeResistance: 0.65,
      dragResistance: 0.05,
      onDragStart: function () {
        gsap.to(this.target, {
          scale: isMinimized ? 1.05 : 1.02,
          duration: 0.2,
        });
      },
      onDragEnd: function () {
        gsap.to(this.target, {
          scale: 1,
          duration: 0.2,
        });
      },
    })[0];
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    gsap.registerPlugin(Draggable);
    createDraggable();

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMinimized, isMobile]);

  // Position and resize handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const padding = 20;

        // Get current transform position
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        // Calculate bounds
        const maxX = windowWidth - rect.width - padding;
        const maxY = windowHeight - rect.height - padding;
        const minX = padding;
        const minY = padding;

        // Check if current position is out of bounds
        if (
          currentX < minX ||
          currentX > maxX ||
          currentY < minY ||
          currentY > maxY
        ) {
          gsap.to(containerRef.current, {
            x: Math.min(Math.max(currentX, minX), maxX),
            y: Math.min(Math.max(currentY, minY), maxY),
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial positioning - only runs once
  useEffect(() => {
    if (isInitialPositionSet.current) return;

    const setInitialPosition = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const element = containerRef.current.getBoundingClientRect();

        // Position in top-right corner with some padding (different from clock)
        let newX = viewportWidth - element.width - 130;
        let newY = 200; // Same Y position as clock

        // Ensure it stays within bounds
        newX = Math.max(20, Math.min(newX, viewportWidth - element.width - 20));
        newY = Math.max(
          20,
          Math.min(newY, viewportHeight - element.height - 20)
        );

        gsap.set(containerRef.current, {
          x: newX,
          y: newY,
        });

        isInitialPositionSet.current = true;
      }
    };

    // Initial position with a slight delay to ensure the component is mounted
    setTimeout(setInitialPosition, 100);
  }, []);

  // Handle size changes when minimizing/maximizing without changing position
  useEffect(() => {
    if (!isInitialPositionSet.current) return;

    if (containerRef.current) {
      if (isMobile && !isMinimized) {
        containerRef.current.classList.add(styles.mobileFixed);
        // Kill draggable when expanded on mobile
        if (draggableInstance.current) {
          draggableInstance.current.kill();
        }
      } else {
        containerRef.current.classList.remove(styles.mobileFixed);
        // Recreate draggable when minimized
        createDraggable();
      }
    }
  }, [isMinimized, isMobile]);

  // Update effect to handle position saving when activeComponent changes
  useEffect(() => {
    // Save position when any component becomes active or changes
    if (containerRef.current) {
      const currentX = gsap.getProperty(containerRef.current, "x");
      const currentY = gsap.getProperty(containerRef.current, "y");

      // Only save position if it's valid and different from the initial values
      if (
        currentX !== undefined &&
        currentY !== undefined &&
        (currentX !== 0 || currentY !== 0)
      ) {
        // Save position at two points:
        // 1. When a component becomes active and position isn't saved yet
        // 2. When activeComponent is null (everything is minimized) to capture latest position
        if (
          (activeComponent !== null && !positionSaved.current) ||
          activeComponent === null
        ) {
          setLastPosition({ x: currentX, y: currentY });
          positionSaved.current = activeComponent !== null;
        }
      }
    }
  }, [activeComponent]);

  // Effect to restore position
  useEffect(() => {
    // Restore position when components are minimized and we have a valid saved position
    if (
      activeComponent === null &&
      containerRef.current &&
      lastPosition.x !== 0 &&
      lastPosition.y !== 0
    ) {
      gsap.set(containerRef.current, {
        x: lastPosition.x,
        y: lastPosition.y,
      });

      // Recreate draggable after position restoration
      createDraggable();
    }
  }, [activeComponent, lastPosition]);

  // Position reset safety check
  useEffect(() => {
    // This is a safety check to reset the position if the component ends up at 0,0
    const safetyCheckTimer = setTimeout(() => {
      if (containerRef.current) {
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        // If the position is at the origin (potentially a reset issue)
        // and we have a valid last position
        if (
          currentX === 0 &&
          currentY === 0 &&
          lastPosition.x !== 0 &&
          lastPosition.y !== 0
        ) {
          gsap.set(containerRef.current, {
            x: lastPosition.x,
            y: lastPosition.y,
          });
        }
      }
    }, 500); // Check after a short delay to allow for normal positioning

    return () => clearTimeout(safetyCheckTimer);
  }, [lastPosition, activeComponent]);

  // Update effect to handle z-index changes when activeComponent changes
  useEffect(() => {
    if (containerRef.current) {
      if (activeComponent === "image") {
        // When an image is expanded, ensure the component is behind the backdrop
        gsap.set(containerRef.current, { zIndex: 50 });
      } else {
        // Restore normal z-index when no image is expanded
        gsap.set(containerRef.current, { zIndex: 2000 });
      }
    }
  }, [activeComponent]);

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

  if (!showAbout) return null;

  return (
    <div style={{ display: showAbout ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={`${styles.draggableWrapper} ${
          isMobile && !isMinimized ? styles.mobileFixed : ""
        } ${activeComponent === "image" ? styles.hidden : ""}`}
      >
        <div
          className={`${styles.expandButton} about-toggle-button`}
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
                  Kirill Ginko is a creative developer and visual storyteller—
                  shaping digital experiences, visuals, and brand identities.
                  His work moves between interactive design, visual identity,
                  illustration, and video, with a focus on building cohesive
                  branding across mediums.
                </p>
                <p className={styles.bioText}>
                  Rooted in a deep understanding of branding and marketing,
                  helping companies, and individuals craft experiences that tell
                  a story. His approach to digital is immersive, blending
                  design, motion graphics, and interactivity to create
                  environments that invite users to engage, explore, and
                  remember.
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
