"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/analogClock.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";

const AnalogClock = () => {
  const containerRef = useRef(null);
  const draggableInstance = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const positionSaved = useRef(false);
  const isInitialPositionSet = useRef(false);
  const {
    showAnalogClock,
    setShowBackdrop,
    setActiveComponent,
    activeComponent,
  } = useGlobalState();

  // Clock hands refs
  const hourHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const secondHandRef = useRef(null);

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

        // Position in top-right corner with some padding
        let newX = viewportWidth - element.width - 40;
        let newY = 200; // 100px from top

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
        containerRef.current.classList.add(styles.draggableWrapperMobile);
        // Kill draggable when expanded on mobile
        if (draggableInstance.current) {
          draggableInstance.current.kill();
        }
      } else {
        containerRef.current.classList.remove(styles.draggableWrapperMobile);
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
    // This is a safety check to reset the position if the clock ends up at 0,0
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
        // When an image is expanded, ensure the clock is behind the backdrop
        gsap.set(containerRef.current, { zIndex: 50 });
      } else {
        // Restore normal z-index when no image is expanded
        gsap.set(containerRef.current, { zIndex: 2000 });
      }
    }
  }, [activeComponent]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const hourAngle = (hours + minutes / 60) * 30;
      const minuteAngle = (minutes + seconds / 60) * 6;
      const secondAngle = seconds * 6;

      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourAngle}deg)`;
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minuteAngle}deg)`;
      }
      if (secondHandRef.current) {
        secondHandRef.current.style.transform = `rotate(${secondAngle}deg)`;
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMinimized = () => {
    if (!isMinimized) {
      setShowBackdrop(false);
      setActiveComponent(null);
    } else if (isMobile) {
      setShowBackdrop(true);
      setActiveComponent("clock");
    }
    setIsMinimized((prev) => !prev);
  };

  if (!showAnalogClock) return null;

  return (
    <div style={{ display: showAnalogClock ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={`${styles.draggableWrapper} ${
          isMobile && !isMinimized ? styles.draggableWrapperMobile : ""
        } ${activeComponent === "image" ? styles.hidden : ""}`}
      >
        <div
          className={`${styles.expandButton} clock-toggle-button`}
          onClick={toggleMinimized}
        >
          {isMinimized ? (
            <BsArrowsAngleExpand className={styles.toggleIcon} />
          ) : (
            <BsArrowsAngleContract className={styles.toggleIcon} />
          )}
        </div>
        <div
          className={`${styles.clockContainer} ${
            isMinimized ? styles.minimizedContainer : styles.normalContainer
          }`}
        >
          <div className={styles.clockFace}>
            <div className={styles.center}></div>
            <div ref={hourHandRef} className={styles.hourHand}></div>
            <div ref={minuteHandRef} className={styles.minuteHand}></div>
            <div ref={secondHandRef} className={styles.secondHand}></div>

            {/* Hour markers and numbers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              const markerRadius = isMinimized
                ? 28
                : window.innerWidth <= 768
                ? 160
                : 120;
              const numberRadius = markerRadius - (isMinimized ? 8 : 25);
              return (
                <div key={`hour-${i}`}>
                  <div
                    className={styles.hourMarker}
                    style={{
                      transform: `translateX(-50%) translateY(-50%) rotate(${angle}deg) translateY(-${markerRadius}px)`,
                    }}
                  />
                  {!isMinimized && (
                    <div
                      className={styles.hourNumber}
                      style={{
                        transform: `translateX(-50%) translateY(-50%) rotate(${angle}deg) translateY(-${numberRadius}px) rotate(${-angle}deg)`,
                      }}
                    >
                      {i === 0 ? "12" : i}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Minute markers */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = i * 6;
              const markerRadius = isMinimized
                ? 28
                : window.innerWidth <= 768
                ? 160
                : 120;
              return (
                i % 5 !== 0 && (
                  <div
                    key={`minute-${i}`}
                    className={styles.minuteMarker}
                    style={{
                      transform: `translateX(-50%) translateY(-50%) rotate(${angle}deg) translateY(-${markerRadius}px)`,
                    }}
                  />
                )
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogClock;
