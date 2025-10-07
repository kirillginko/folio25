"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/draggableCard.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import { useGlobalState } from "../context/GlobalStateContext";

const DraggableCard = () => {
  const containerRef = useRef(null);
  const draggableInstance = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const isInitialPositionSet = useRef(false);
  const stablePositionRef = useRef({ x: 0, y: 0 });
  const positionBeforeImageRef = useRef({ x: 0, y: 0 });
  const { setShowBackdrop, setActiveComponent, activeComponent } =
    useGlobalState();

  // Position adjustment effect
  useEffect(() => {
    const adjustPositionAndSize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const element = containerRef.current.getBoundingClientRect();

        let newX, newY;

        // If we're closing an image, use stored position
        if (
          activeComponent === null &&
          positionBeforeImageRef.current.x !== 0
        ) {
          newX = positionBeforeImageRef.current.x;
          newY = positionBeforeImageRef.current.y;

          gsap.set(containerRef.current, {
            x: newX,
            y: newY,
          });

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
            // Default fallback position - center
            newX = (viewportWidth - element.width) / 2;
            newY = (viewportHeight - element.height) / 2;
          }
        }

        // Ensure position is within bounds
        newX = Math.max(20, Math.min(newX, viewportWidth - element.width - 20));
        newY = Math.max(
          20,
          Math.min(newY, viewportHeight - element.height - 20)
        );

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
    };

    const timer = setTimeout(adjustPositionAndSize, 10);
    return () => clearTimeout(timer);
  }, [isMobile, activeComponent]);

  // Draggable creation
  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const handleRecreateDraggables = () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      setTimeout(() => {
        createDraggable();
      }, 50);
    };

    const createDraggable = () => {
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
            scale: 1.05,
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
    };

    createDraggable();

    const imageClosedListener = () => {
      if (activeComponent === null) {
        setTimeout(() => {
          if (draggableInstance.current) {
            draggableInstance.current.kill();
          }
          createDraggable();
        }, 50);
      }
    };

    imageClosedListener();

    window.addEventListener("recreateDraggables", handleRecreateDraggables);

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener(
        "recreateDraggables",
        handleRecreateDraggables
      );
    };
  }, [isMobile, activeComponent]);

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

        // Calculate the actual position including CSS left/top
        const computedLeft =
          parseFloat(getComputedStyle(containerRef.current).left) || 0;
        const computedTop =
          parseFloat(getComputedStyle(containerRef.current).top) || 0;
        const actualX = computedLeft + currentX;
        const actualY = computedTop + currentY;

        // Calculate bounds
        const maxX = windowWidth - rect.width - padding;
        const maxY = windowHeight - rect.height - padding;
        const minX = padding;
        const minY = padding;

        // Check if actual position is out of bounds
        if (
          actualX < minX ||
          actualX > maxX ||
          actualY < minY ||
          actualY > maxY
        ) {
          // Calculate new transform values to bring element within bounds
          const targetX = Math.min(Math.max(actualX, minX), maxX);
          const targetY = Math.min(Math.max(actualY, minY), maxY);

          gsap.to(containerRef.current, {
            x: targetX - computedLeft,
            y: targetY - computedTop,
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

        // Calculate position based on CSS left: 50%, top: 50%
        let newX = (viewportWidth - element.width) / 2;
        let newY = (viewportHeight - element.height) / 2;

        // Ensure it stays within bounds
        newX = Math.max(20, Math.min(newX, viewportWidth - element.width - 20));
        newY = Math.max(
          20,
          Math.min(newY, viewportHeight - element.height - 20)
        );

        // Set transform to 0,0 since CSS positioning handles the initial placement
        gsap.set(containerRef.current, {
          x: 0,
          y: 0,
          left: "35%",
          top: "50%",
        });

        stablePositionRef.current = { x: newX, y: newY };
        setLastPosition({ x: newX, y: newY });
        isInitialPositionSet.current = true;
      }
    };

    setTimeout(setInitialPosition, 100);
  }, []);

  // Track component position continuously
  useEffect(() => {
    if (!containerRef.current || !isInitialPositionSet.current) return;

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

      if (
        currentX !== undefined &&
        currentY !== undefined &&
        (currentX !== 0 || currentY !== 0) &&
        !(Math.abs(currentX) < 5 && Math.abs(currentY) < 5)
      ) {
        positionBeforeImageRef.current = { x: currentX, y: currentY };
        stablePositionRef.current = { x: currentX, y: currentY };
        setLastPosition({ x: currentX, y: currentY });
      }
    }
  }, [activeComponent]);

  return (
    <div
      ref={containerRef}
      className={`${styles.draggableWrapper} ${
        activeComponent === "image" ? styles.hidden : ""
      }`}
    >
      <div className={styles.cardContainer}>
        <Image
          src="https://res.cloudinary.com/ddkuxrisq/image/upload/v1759870331/cardfinal3_pzsbpd.webp"
          alt="Draggable Card"
          width={600}
          height={800}
          priority
          className={styles.cardImage}
        />
      </div>
    </div>
  );
};

export default DraggableCard;
