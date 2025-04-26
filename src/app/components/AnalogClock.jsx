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
  const { showAnalogClock, setShowBackdrop, setActiveComponent } =
    useGlobalState();

  // Clock hands refs
  const hourHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const secondHandRef = useRef(null);

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
  }, []);

  const createDraggable = () => {
    if (containerRef.current) {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: 0.65,
        dragResistance: 0.05,
        zIndexBoost: true,
        onPress: function (e) {
          if (e.target.closest(`.${styles.expandButton}`)) {
            this.endDrag(e);
          }
        },
        onDragStart: function () {
          gsap.to(this.target, {
            scale: isMinimized ? 1.05 : 1.02,
            duration: 0.2,
          });
        },
        onDragEnd: function () {
          gsap.to(this.target, { scale: 1, duration: 0.2 });

          const element = this.target.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const maxX = viewportWidth - element.width - 20;
          const maxY = viewportHeight - element.height - 20;

          if (this.x < 20 || this.x > maxX || this.y < 20 || this.y > maxY) {
            gsap.to(this.target, {
              x: Math.min(Math.max(this.x, 20), maxX),
              y: Math.min(Math.max(this.y, 20), maxY),
              duration: 0.15,
              ease: "power2.out",
            });
          }
        },
      })[0];
    }
  };

  useEffect(() => {
    if (!draggableInstance.current) return;

    if (isMobile && !isMinimized) {
      draggableInstance.current.disable();
    } else {
      draggableInstance.current.enable();
    }
  }, [isMinimized, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const element = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxX = viewportWidth - element.width - 20;
        const maxY = viewportHeight - element.height - 20;
        const currentX = gsap.getProperty(containerRef.current, "x") || 0;
        const currentY = gsap.getProperty(containerRef.current, "y") || 0;

        if (
          currentX < 20 ||
          currentX > maxX ||
          currentY < 20 ||
          currentY > maxY
        ) {
          gsap.to(containerRef.current, {
            x: Math.min(Math.max(currentX, 20), maxX),
            y: Math.min(Math.max(currentY, 20), maxY),
            duration: 0.15,
            ease: "power2.out",
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            zIndex: 10000,
          }),
      }}
    >
      <div className={styles.expandButton} onClick={toggleMinimized}>
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
            const markerRadius = isMinimized ? 28 : 120; // Radius for markers
            const numberRadius = markerRadius - (isMinimized ? 8 : 25); // Position numbers slightly inside markers
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
            const markerRadius = isMinimized ? 28 : 120;
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
  );
};

export default AnalogClock;
