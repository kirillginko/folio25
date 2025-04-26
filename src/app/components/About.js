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
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const draggableInstance = useRef(null);
  const { showAbout, setShowBackdrop, setActiveComponent } = useGlobalState();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (isMinimized || !isMobile) {
      gsap.registerPlugin(Draggable);
      createDraggable();
    } else if (draggableInstance.current) {
      draggableInstance.current.kill();
    }

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMinimized, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && (isMinimized || !isMobile)) {
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
  }, [isMinimized, isMobile]);

  const createDraggable = () => {
    if (containerRef.current) {
      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
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
          gsap.to(this.target, { scale: 1, duration: 0.2 });

          // Check bounds after drag
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

  return (
    <div
      ref={containerRef}
      className={styles.draggableWrapper}
      style={{
        display: showAbout ? "block" : "none",
      }}
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
                shaping digital experiences, visuals, and brand identities. His
                work moves between interactive design, visual identity,
                illustration, and video, with a focus on building cohesive
                branding across mediums.
              </p>
              <p className={styles.bioText}>
                Rooted in a deep understanding of branding and marketing,
                helping companies, and individuals craft experiences that tell a
                story. His approach to digital is immersive, blending design,
                motion graphics, and interactivity to create environments that
                invite users to engage, explore, and remember.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default About;
