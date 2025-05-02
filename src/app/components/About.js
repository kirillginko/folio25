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

  // Add a stable position ref to persist across renders
  const stablePositionRef = useRef({ x: 0, y: 0 });
  const positionBeforeImageRef = useRef({ x: 0, y: 0 });

  const createDraggable = () => {
    if (!containerRef.current) return;

    if (draggableInstance.current) {
      draggableInstance.current.kill();
    }

    // Ensure any inline transforms are preserved before creating draggable
    const currentX = gsap.getProperty(containerRef.current, "x") || 0;
    const currentY = gsap.getProperty(containerRef.current, "y") || 0;

    // Determine which position to use
    let positionToUse = { x: currentX, y: currentY };

    // If current position is at origin (0,0) but we have a saved position
    if (currentX === 0 && currentY === 0) {
      // Try position saved right before image was shown
      if (positionBeforeImageRef.current.x !== 0) {
        positionToUse = positionBeforeImageRef.current;
      }
      // Fall back to the last tracked stable position
      else if (stablePositionRef.current.x !== 0) {
        positionToUse = stablePositionRef.current;
      }
      // Finally, try the state-based last position
      else if (lastPosition.x !== 0) {
        positionToUse = lastPosition;
      }

      // Apply the position before creating draggable
      gsap.set(containerRef.current, positionToUse);
    }

    // Create the draggable with the position already set
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

        // Save position after drag ends
        const newX = gsap.getProperty(containerRef.current, "x");
        const newY = gsap.getProperty(containerRef.current, "y");

        if (newX !== undefined && newY !== undefined) {
          stablePositionRef.current = { x: newX, y: newY };
          setLastPosition({ x: newX, y: newY });
          positionBeforeImageRef.current = { x: newX, y: newY };
        }
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

  // Add a function to force position restoration
  const forceRestorePosition = () => {
    if (!containerRef.current || !showAbout) return;

    // Choose the best position to restore
    let positionToUse = { x: 0, y: 0 };

    if (positionBeforeImageRef.current.x !== 0) {
      positionToUse = positionBeforeImageRef.current;
    } else if (stablePositionRef.current.x !== 0) {
      positionToUse = stablePositionRef.current;
    } else if (lastPosition.x !== 0) {
      positionToUse = lastPosition;
    }

    // Only apply if we have a valid position
    if (positionToUse.x !== 0 || positionToUse.y !== 0) {
      console.log("About: Restoring position to", positionToUse);

      // First try with GSAP
      gsap.set(containerRef.current, positionToUse);

      // As a fallback, also try direct style manipulation
      containerRef.current.style.transform = `translate3d(${positionToUse.x}px, ${positionToUse.y}px, 0px)`;

      // Recreate draggable instance
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      // Create new draggable with a slight delay
      setTimeout(() => {
        // Double-check position before creating draggable
        const currentX = gsap.getProperty(containerRef.current, "x") || 0;
        const currentY = gsap.getProperty(containerRef.current, "y") || 0;

        if (Math.abs(currentX) < 5 && Math.abs(currentY) < 5) {
          // Position was lost, apply again
          gsap.set(containerRef.current, positionToUse);
          containerRef.current.style.transform = `translate3d(${positionToUse.x}px, ${positionToUse.y}px, 0px)`;
        }

        createDraggable();
      }, 50);
    }
  };

  // Add useEffect to specifically watch for image gallery changes
  useEffect(() => {
    // If image gallery is closed (activeComponent goes from "image" to null)
    // and we have a saved position, restore it
    if (activeComponent === null && showAbout) {
      // Use a healthy delay to ensure any other animations complete first
      setTimeout(forceRestorePosition, 100);
    }
  }, [activeComponent, showAbout]);

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
    // Always try to get the current position
    if (containerRef.current && showAbout) {
      const currentX = gsap.getProperty(containerRef.current, "x");
      const currentY = gsap.getProperty(containerRef.current, "y");

      // Only save position if it's valid and different from the initial values
      if (
        currentX !== undefined &&
        currentY !== undefined &&
        (currentX !== 0 || currentY !== 0) &&
        !(Math.abs(currentX) < 5 && Math.abs(currentY) < 5) // Ignore very small values
      ) {
        // When activeComponent becomes "image", we're showing the image gallery
        // Save the current position to restore later
        if (activeComponent === "image") {
          positionBeforeImageRef.current = { x: currentX, y: currentY };
          stablePositionRef.current = { x: currentX, y: currentY };
          setLastPosition({ x: currentX, y: currentY });
          positionSaved.current = true;
        }

        // When activeComponent becomes null, we're closing all components
        // This is a good time to save the current position
        if (activeComponent === null) {
          // Only update if we have a valid position
          stablePositionRef.current = { x: currentX, y: currentY };
          setLastPosition({ x: currentX, y: currentY });
          positionSaved.current = false;
        }
      }
    }
  }, [activeComponent, showAbout]);

  // Effect to restore position
  useEffect(() => {
    // When images are closed (activeComponent becomes null) and we have a valid saved position
    if (
      activeComponent === null &&
      containerRef.current &&
      lastPosition.x !== 0 &&
      lastPosition.y !== 0 &&
      showAbout // Only restore if the component is visible
    ) {
      // Small delay to ensure position is restored after any animation
      setTimeout(() => {
        if (containerRef.current) {
          gsap.set(containerRef.current, {
            x: lastPosition.x,
            y: lastPosition.y,
          });

          // Recreate draggable after position restoration
          createDraggable();
        }
      }, 10);
    }
  }, [activeComponent, lastPosition, showAbout]);

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

  // Handle visibility changes
  useEffect(() => {
    // When the About component becomes visible again after being hidden
    if (showAbout && isInitialPositionSet.current && containerRef.current) {
      // Small delay to ensure the component is fully mounted
      setTimeout(() => {
        const currentX = gsap.getProperty(containerRef.current, "x") || 0;
        const currentY = gsap.getProperty(containerRef.current, "y") || 0;

        // If the component position is at the origin (0,0), restore it
        if (
          (currentX === 0 && currentY === 0) ||
          (Math.abs(currentX) < 5 && Math.abs(currentY) < 5)
        ) {
          // Find the best position to restore from our various position refs
          let positionToRestore = { x: 0, y: 0 };

          if (positionBeforeImageRef.current.x !== 0) {
            positionToRestore = positionBeforeImageRef.current;
          } else if (stablePositionRef.current.x !== 0) {
            positionToRestore = stablePositionRef.current;
          } else if (lastPosition.x !== 0) {
            positionToRestore = lastPosition;
          }

          // Only restore if we found a valid position
          if (positionToRestore.x !== 0 || positionToRestore.y !== 0) {
            gsap.set(containerRef.current, positionToRestore);

            // Make sure the draggable is recreated at this position
            if (draggableInstance.current) {
              draggableInstance.current.kill();
            }
            createDraggable();
          }
        }
      }, 50);
    }
  }, [showAbout]);

  const toggleMinimized = () => {
    if (!isMinimized) {
      setShowBackdrop(false);
      setActiveComponent(null);

      // When minimizing, ensure we restore proper position if needed
      if (activeComponent === "image") {
        setTimeout(forceRestorePosition, 100);
      }
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
