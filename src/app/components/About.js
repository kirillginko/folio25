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
  const isInitialPositionSet = useRef(false);
  const stablePositionRef = useRef({ x: 0, y: 0 });
  const positionBeforeImageRef = useRef({ x: 0, y: 0 });
  const { showAbout, setShowBackdrop, setActiveComponent, activeComponent } =
    useGlobalState();

  // Add a position adjustment effect that runs on component state changes
  useEffect(() => {
    const adjustPositionAndSize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (isMobile && !isMinimized) {
          // For mobile expanded view
          gsap.set(containerRef.current, {
            x: 0,
            y: 0,
          });
        } else {
          // For desktop or minimized view, maintain position
          const element = containerRef.current.getBoundingClientRect();

          // IMPORTANT: For image closing, always use stored position
          let newX, newY;

          // If we're closing an image (activeComponent changed from "image" to null)
          // Always use the position that was saved before the image was opened
          if (
            activeComponent === null &&
            positionBeforeImageRef.current.x !== 0
          ) {
            newX = positionBeforeImageRef.current.x;
            newY = positionBeforeImageRef.current.y;

            // Apply position immediately with no animation
            gsap.set(containerRef.current, {
              x: newX,
              y: newY,
            });

            // Also update other position refs for consistency
            stablePositionRef.current = { x: newX, y: newY };
            setLastPosition({ x: newX, y: newY });
            return;
          }

          // For other cases, use current position or fall back to stored positions
          newX = gsap.getProperty(containerRef.current, "x");
          newY = gsap.getProperty(containerRef.current, "y");

          // If position is invalid, use saved positions
          if (!newX || !newY || (Math.abs(newX) < 5 && Math.abs(newY) < 5)) {
            if (stablePositionRef.current.x !== 0) {
              newX = stablePositionRef.current.x;
              newY = stablePositionRef.current.y;
            } else if (lastPosition.x !== 0) {
              newX = lastPosition.x;
              newY = lastPosition.y;
            } else {
              // Default fallback position
              newX = viewportWidth - element.width - 130;
              newY = 200;
            }
          }

          // Ensure position is within bounds
          newX = Math.max(
            20,
            Math.min(newX, viewportWidth - element.width - 20)
          );
          newY = Math.max(
            20,
            Math.min(newY, viewportHeight - element.height - 20)
          );

          // Apply position with no animation to prevent movement
          gsap.set(containerRef.current, {
            x: newX,
            y: newY,
          });

          // Store the position only if we're not closing an image
          if (activeComponent !== "image") {
            stablePositionRef.current = { x: newX, y: newY };
            setLastPosition({ x: newX, y: newY });
          }
        }
      }
    };

    // Run with a delay to ensure component is mounted
    const timer = setTimeout(adjustPositionAndSize, 10);

    return () => clearTimeout(timer);
  }, [isMinimized, isMobile, activeComponent, showAbout]);

  // Enhance the draggable creation to ensure it's recreated properly after image interaction
  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const createDraggable = () => {
      // Only create draggable if component should be draggable
      if (isMinimized || !isMobile) {
        // Kill any existing draggable
        if (draggableInstance.current) {
          draggableInstance.current.kill();
        }

        // Create new draggable
        draggableInstance.current = Draggable.create(containerRef.current, {
          type: "x,y",
          bounds: "body",
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          edgeResistance: 0.65,
          dragResistance: 0.05,
          zIndexBoost: true,
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

            // Save position after drag
            if (containerRef.current) {
              const newX = gsap.getProperty(containerRef.current, "x");
              const newY = gsap.getProperty(containerRef.current, "y");

              stablePositionRef.current = { x: newX, y: newY };
              positionBeforeImageRef.current = { x: newX, y: newY };
              setLastPosition({ x: newX, y: newY });
            }
          },
        })[0];
      } else if (draggableInstance.current) {
        // Kill draggable if component shouldn't be draggable (mobile expanded)
        draggableInstance.current.kill();
      }
    };

    // Create draggable on mount and when state changes
    createDraggable();

    // Create additional listeners specifically for image gallery interactions
    const imageClosedListener = () => {
      if (activeComponent === null && showAbout) {
        // Wait for GSAP to apply the position before recreating draggable
        setTimeout(() => {
          if (draggableInstance.current) {
            draggableInstance.current.kill();
          }
          createDraggable();
        }, 50);
      }
    };

    // Call the listener when activeComponent changes
    imageClosedListener();

    // Clean up on unmount
    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [isMinimized, isMobile, activeComponent, showAbout]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

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

        // Save current position to stable ref
        if (currentX !== undefined && currentY !== undefined) {
          stablePositionRef.current = { x: currentX, y: currentY };
        }

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

        // Save this initial position
        stablePositionRef.current = { x: newX, y: newY };
        setLastPosition({ x: newX, y: newY });
        isInitialPositionSet.current = true;
      }
    };

    // Initial position with a slight delay to ensure the component is mounted
    setTimeout(setInitialPosition, 100);
  }, []);

  // Track component position continuously
  useEffect(() => {
    if (!containerRef.current || !isInitialPositionSet.current) return;

    // Update position tracking on an interval
    const trackInterval = setInterval(() => {
      if (containerRef.current && activeComponent !== "image") {
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        if (
          currentX !== undefined &&
          currentY !== undefined &&
          (currentX !== 0 || currentY !== 0)
        ) {
          stablePositionRef.current = { x: currentX, y: currentY };
          setLastPosition({ x: currentX, y: currentY });
        }
      }
    }, 500);

    return () => clearInterval(trackInterval);
  }, [activeComponent]);

  // Save position when image is about to be shown
  useEffect(() => {
    if (activeComponent === "image" && containerRef.current) {
      const currentX = gsap.getProperty(containerRef.current, "x");
      const currentY = gsap.getProperty(containerRef.current, "y");

      if (currentX !== undefined && currentY !== undefined) {
        positionBeforeImageRef.current = { x: currentX, y: currentY };
      }
    }
  }, [activeComponent]);

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

  // Add a dedicated effect to save position before image is shown
  useEffect(() => {
    // This effect runs specifically when an image is about to be displayed
    if (activeComponent === "image" && containerRef.current) {
      // Get the current position
      const currentX = gsap.getProperty(containerRef.current, "x");
      const currentY = gsap.getProperty(containerRef.current, "y");

      // Only save if we have valid coordinates
      if (
        currentX !== undefined &&
        currentY !== undefined &&
        (currentX !== 0 || currentY !== 0) &&
        !(Math.abs(currentX) < 5 && Math.abs(currentY) < 5)
      ) {
        console.log("Saving position before image:", {
          x: currentX,
          y: currentY,
        });

        // Save to all position refs for redundancy
        positionBeforeImageRef.current = { x: currentX, y: currentY };
        stablePositionRef.current = { x: currentX, y: currentY };
        setLastPosition({ x: currentX, y: currentY });
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
