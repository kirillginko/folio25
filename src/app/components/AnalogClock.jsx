"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/analogClock.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";

const AnalogClock = () => {
  const containerRef = useRef(null);
  const clockContainerRef = useRef(null);
  const draggableInstance = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
      },
    })[0];
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleRecreateDraggables = () => {
      setTimeout(() => {
        createDraggable();
      }, 50);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("recreateDraggables", handleRecreateDraggables);

    gsap.registerPlugin(Draggable);
    createDraggable();

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener(
        "recreateDraggables",
        handleRecreateDraggables
      );
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

        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        const maxX = windowWidth - rect.width - padding;
        const maxY = windowHeight - rect.height - padding;
        const minX = padding;
        const minY = padding;

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

  // Initial positioning
  useEffect(() => {
    if (isInitialPositionSet.current) return;

    const setInitialPosition = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const element = containerRef.current.getBoundingClientRect();

        let newX = viewportWidth - element.width - 40;
        let newY = 200;

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

    setTimeout(setInitialPosition, 100);
  }, []);

  // Clock update
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
          ref={clockContainerRef}
          className={`${styles.clockContainer} ${
            isMinimized ? styles.minimizedContainer : styles.normalContainer
          }`}
        >
          <div
            className={`${styles.clockFace} ${
              isMinimized ? styles.minimizedClockFace : styles.normalClockFace
            }`}
          >
            <div className={styles.center}></div>
            <div ref={hourHandRef} className={styles.hourHand}></div>
            <div ref={minuteHandRef} className={styles.minuteHand}></div>
            <div ref={secondHandRef} className={styles.secondHand}></div>

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
