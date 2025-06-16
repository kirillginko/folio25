"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import images from "../images";
import styles from "../styles/imageGallery.module.css";
import { useGlobalState } from "../context/GlobalStateContext";

const ImageGallery = () => {
  const imageRefs = useRef([]);
  const draggableInstances = useRef([]);
  const zIndexCounter = useRef(1);
  const [isVisible, setIsVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const originalPositions = useRef(new Map()); // Store original positions of components
  const lastKnownPositions = useRef(new Map()); // Store last known positions before flying off-screen
  const isAnimatingComponents = useRef(false); // Track if components are currently animating
  const animationTimeouts = useRef([]); // Store timeout references for cleanup
  const isGalleryClosing = useRef(false); // Track if gallery is in the process of closing
  const {
    setShowAbout,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
    setShowAnalogClock,
    showWorkButton,
    setActiveComponent,
  } = useGlobalState();

  // Helper functions for animation management
  const clearAllTimeouts = () => {
    animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    animationTimeouts.current = [];
  };

  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(callback, delay);
    animationTimeouts.current.push(timeoutId);
    return timeoutId;
  };

  const storeCurrentPositions = () => {
    // Store current positions of all components before any animation
    const allDraggables = document.querySelectorAll(
      '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
    );

    allDraggables.forEach((element, index) => {
      // Skip if this is part of the ImageGallery or Email component
      if (
        element.closest(".interactive-element") ||
        element.className.toLowerCase().includes("email") ||
        element.id?.toLowerCase().includes("email")
      ) {
        return;
      }

      const elementKey = element.id || `element-${index}`;
      const currentX = gsap.getProperty(element, "x") || 0;
      const currentY = gsap.getProperty(element, "y") || 0;
      const isMusicPlayer = element.className
        .toLowerCase()
        .includes("musicplayer");

      // Store current position (no rotation for components)
      lastKnownPositions.current.set(elementKey, {
        x: currentX,
        y: currentY,
        rotation: 0, // Always keep components at 0 rotation
        isMusicPlayer: isMusicPlayer,
      });

      // Store original position only if it hasn't been stored yet
      if (!originalPositions.current.has(elementKey)) {
        let finalX = currentX;
        let finalY = currentY;

        if (isMusicPlayer) {
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);

          if (computedStyle.position === "fixed") {
            finalX = currentX !== 0 ? currentX : rect.left || finalX;
            finalY = currentY !== 0 ? currentY : rect.top || finalY;
          }
        }

        originalPositions.current.set(elementKey, {
          x: finalX,
          y: finalY,
          rotation: 0, // Always keep components at 0 rotation
          isMusicPlayer: isMusicPlayer,
        });
      }
    });
  };

  const getRandomPosition = () => {
    const imageSize = 220;

    return {
      x: Math.random() * (window.innerWidth - imageSize),
      y: Math.random() * (window.innerHeight - imageSize),
    };
  };

  const getOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const padding = 300; // Distance off screen for gallery images

    switch (side) {
      case 0: // top
        return {
          x: Math.random() * window.innerWidth,
          y: -padding,
        };
      case 1: // right
        return {
          x: window.innerWidth + padding,
          y: Math.random() * window.innerHeight,
        };
      case 2: // bottom
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + padding,
        };
      case 3: // left
        return {
          x: -padding,
          y: Math.random() * window.innerHeight,
        };
    }
  };

  // Separate function for components with larger padding to ensure they're completely off-screen
  const getComponentOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const padding = Math.max(window.innerWidth, window.innerHeight) + 500; // Use viewport size + extra padding

    switch (side) {
      case 0: // top
        return {
          x: Math.random() * window.innerWidth,
          y: -padding,
        };
      case 1: // right
        return {
          x: window.innerWidth + padding,
          y: Math.random() * window.innerHeight,
        };
      case 2: // bottom
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + padding,
        };
      case 3: // left
        return {
          x: -padding,
          y: Math.random() * window.innerHeight,
        };
    }
  };

  // Function to animate specific components off-screen when work button is clicked
  const flyComponentsOffScreen = () => {
    console.log("flyComponentsOffScreen called");

    // Clear any pending timeouts and set animation state
    clearAllTimeouts();
    isAnimatingComponents.current = true;
    isGalleryClosing.current = false; // Reset closing flag when opening

    // Store current positions immediately before any animation
    storeCurrentPositions();

    // Force minimize any expanded components first by resetting activeComponent
    setActiveComponent(null);

    // Small delay to allow components to minimize before animating off-screen
    addTimeout(() => {
      // Double-check if we should still be animating (user might have closed quickly)
      if (!isAnimatingComponents.current || isGalleryClosing.current) {
        console.log("Animation cancelled - components should not fly off");
        return;
      }

      // Get all draggable wrapper elements (About, BrushCanvas, AnalogClock) and MusicPlayer using attribute selector
      const allDraggables = document.querySelectorAll(
        '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
      );
      console.log("Found draggable elements:", allDraggables.length);

      allDraggables.forEach((element, index) => {
        console.log(`Element ${index}:`, element);

        // Skip if this is part of the ImageGallery
        if (element.closest(".interactive-element")) {
          console.log(`Skipping element ${index} - part of gallery`);
          return;
        }

        // Skip Email component (keep this stationary)
        if (
          element.className.toLowerCase().includes("email") ||
          element.id?.toLowerCase().includes("email")
        ) {
          console.log(`Skipping element ${index} - Email component`);
          return;
        }

        console.log(`Animating element ${index} off-screen`);
        const pos = getComponentOffScreenPosition();
        console.log(`Target position:`, pos);

        gsap.to(element, {
          x: pos.x,
          y: pos.y,
          duration: 1.2,
          ease: "power2.out",
          onComplete: () =>
            console.log(`Animation complete for element ${index}`),
        });
      });
    }, 100); // 100ms delay to allow minimization
  };

  // Function to handle theme button visibility for individual image expansion
  const handleThemeButtonForImage = (hide) => {
    const themeButton = document.querySelector('[class*="flowerContainer"]');
    if (themeButton) {
      if (hide) {
        // Hide theme button when expanding individual image
        gsap.to(themeButton, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // Show theme button when minimizing individual image
        gsap.to(themeButton, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  };

  // Function to restore components with animation (but immediately cancel conflicts)
  const immediatelyRestoreComponents = () => {
    console.log("immediatelyRestoreComponents called");

    // Clear any pending timeouts and stop any ongoing animations
    clearAllTimeouts();
    isAnimatingComponents.current = false;
    isGalleryClosing.current = true; // Set closing flag immediately to prevent off-screen animations

    // Get all draggable wrapper elements and MusicPlayer
    const allDraggables = document.querySelectorAll(
      '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
    );
    console.log(
      "Found draggable elements to restore with animation:",
      allDraggables.length
    );

    allDraggables.forEach((element, index) => {
      // Skip if this is part of the ImageGallery
      if (element.closest(".interactive-element")) {
        console.log(`Skipping element ${index} - part of gallery`);
        return;
      }

      // Skip Email component (keep this stationary)
      if (
        element.className.toLowerCase().includes("email") ||
        element.id?.toLowerCase().includes("email")
      ) {
        console.log(
          `Skipping element ${index} - Email component during restore`
        );
        return;
      }

      // Skip if element is not visible (display: none) as we can't animate it
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.display === "none") {
        console.log(
          `Skipping element ${index} - element is hidden (display: none)`
        );
        return;
      }

      const elementKey = element.id || `element-${index}`;
      const lastKnownPos = lastKnownPositions.current.get(elementKey);
      const isMusicPlayer = element.className
        .toLowerCase()
        .includes("musicplayer");

      // Kill any ongoing animations on this element first
      gsap.killTweensOf(element);

      if (lastKnownPos) {
        console.log(
          `Restoring element ${index} to last known position with animation:`,
          lastKnownPos
        );

        // Use gsap.to for smooth animation back to position
        // For MusicPlayer, use a longer duration
        const duration = isMusicPlayer ? 1.0 : 0.7;

        gsap.to(element, {
          x: lastKnownPos.x,
          y: lastKnownPos.y,
          rotation: 0, // Always reset rotation to 0 for components
          duration: duration,
          ease: "power2.out",
          onComplete: () => {
            console.log(`Restoration complete for element ${index}`);

            // For MusicPlayer, ensure position is locked after restoration
            if (isMusicPlayer) {
              // Add a class to indicate we're restoring position
              element.classList.add("position-restoring");

              addTimeout(() => {
                gsap.set(element, {
                  x: lastKnownPos.x,
                  y: lastKnownPos.y,
                });

                // Remove the flag after a longer delay
                addTimeout(() => {
                  element.classList.remove("position-restoring");
                }, 500);
              }, 50);
            }
          },
        });
      } else {
        // If no last known position, try to use original position as fallback
        const originalPos = originalPositions.current.get(elementKey);
        if (originalPos) {
          console.log(
            `Using original position as animated fallback for element ${index}`
          );
          gsap.to(element, {
            x: originalPos.x,
            y: originalPos.y,
            rotation: 0, // Always reset rotation to 0 for components
            duration: 0.7,
            ease: "power2.out",
          });
        }
      }
    });
  };

  const shuffleImages = () => {
    if (!isVisible) {
      // If images are hidden, bring them back first
      setIsVisible(true);
      // Also make sure we're not in the middle of component animations
      clearAllTimeouts();
      isAnimatingComponents.current = false;
      isGalleryClosing.current = false;
    }

    imageRefs.current.forEach((ref) => {
      if (!ref) return;
      const pos = getRandomPosition();
      gsap.to(ref, {
        x: pos.x,
        y: pos.y,
        rotation: Math.random() * 30 - 15,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  };

  const toggleImages = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);

    // Animate gallery images
    imageRefs.current.forEach((ref) => {
      if (!ref) return;

      const pos = isVisible ? getOffScreenPosition() : getRandomPosition();
      gsap.to(ref, {
        x: pos.x,
        y: pos.y,
        rotation: Math.random() * 30 - 15,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.05,
      });
    });

    // Handle component animations based on gallery visibility
    if (newVisibility) {
      // Gallery is becoming visible, fly other components off-screen
      // Reset closing flag before flying components off
      isGalleryClosing.current = false;
      flyComponentsOffScreen();
    } else {
      // Gallery is closing, immediately restore components to prevent timing issues

      // Set closing flag immediately to prevent any pending off-screen animations
      isGalleryClosing.current = true;

      // First, restore visibility immediately (before animating) to ensure components can be animated
      setShowAbout(true);
      setShowBrushCanvas(true);
      setShowMusicPlayer(true);
      setShowEmail(true);
      setShowAnalogClock(true);

      // Reset active component state
      setActiveComponent(null);

      // Then, immediately cancel any ongoing component animations and restore with a small delay
      // to allow the visibility changes to take effect
      addTimeout(() => {
        immediatelyRestoreComponents();
      }, 50);

      // Force recreation of draggables after a delay to ensure proper state restoration
      addTimeout(() => {
        // Dispatch a custom event to tell components to recreate their draggables
        window.dispatchEvent(new CustomEvent("recreateDraggables"));
      }, 250);
    }
  };

  const getWindowCenter = () => {
    return {
      x: (window.innerWidth - 200) / 2, // 200 is the base image width
      y: (window.innerHeight - 200) / 2, // 200 is the base image height
    };
  };

  const handleDetailClick = (index, e) => {
    // eslint-disable-next-line no-param-reassign
    e = e || { stopPropagation: () => {} };
    e.stopPropagation();

    if (e.preventDefault) {
      e.preventDefault();
    }

    const getScaleForScreen = () => {
      return window.innerWidth <= 768 ? 1.2 : 3;
    };

    if (selectedImage === index) {
      // Minimize
      gsap.to(imageRefs.current[index], {
        x: getRandomPosition().x,
        y: getRandomPosition().y,
        scale: 1,
        rotation: Math.random() * 30 - 15,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          draggableInstances.current[index].enable();
        },
        onComplete: () => {
          setSelectedImage(null);

          // Show theme button when minimizing an image
          handleThemeButtonForImage(false);

          // Only restore visibility if the gallery itself is hidden
          if (!isVisible) {
            setShowAbout(true);
            setShowBrushCanvas(true);
            setShowMusicPlayer(true);
            setShowEmail(true);
            setShowAnalogClock(true);
          }

          // Reset active component immediately
          setActiveComponent(null);

          // Reset z-index so theme button can stay on top of non-selected images
          gsap.set(imageRefs.current[index], { zIndex: 1 });
        },
      });
    } else {
      if (selectedImage !== null) {
        gsap.to(imageRefs.current[selectedImage], {
          x: getRandomPosition().x,
          y: getRandomPosition().y,
          scale: 1,
          rotation: Math.random() * 30 - 15,
          duration: 0.5,
          ease: "power2.inOut",
          onStart: () => {
            draggableInstances.current[selectedImage].enable();
          },
          onComplete: () => {
            // Reset z-index for previously selected image
            gsap.set(imageRefs.current[selectedImage], { zIndex: 1 });
          },
        });
      }

      const windowCenter = getWindowCenter();
      setSelectedImage(index);
      setShowAbout(false);
      setShowBrushCanvas(false);
      setShowMusicPlayer(false);
      setShowAnalogClock(false);
      setActiveComponent("image");

      // Hide theme button when expanding an image
      handleThemeButtonForImage(true);

      zIndexCounter.current += 1;

      gsap.to(imageRefs.current[index], {
        x: windowCenter.x,
        y: windowCenter.y,
        scale: getScaleForScreen(),
        rotation: 0,
        zIndex: zIndexCounter.current,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          draggableInstances.current[index].disable();
        },
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    toggleImages();
  };

  const navigateImage = (direction) => {
    if (selectedImage === null) return;

    const newIndex =
      direction === "next"
        ? (selectedImage + 1) % images.length
        : (selectedImage - 1 + images.length) % images.length;

    handleDetailClick(newIndex, { stopPropagation: () => {} });
  };

  useEffect(() => {
    // Register the Draggable plugin first
    if (!gsap.registerPlugin) {
      return;
    }
    gsap.registerPlugin(Draggable);

    const createDraggables = () => {
      // Kill existing draggables first
      draggableInstances.current.forEach((instance) => instance?.kill());
      draggableInstances.current = [];

      imageRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const pos = getOffScreenPosition();
        gsap.set(ref, {
          x: pos.x,
          y: pos.y,
          rotation: Math.random() * 30 - 15,
          zIndex: 1,
        });

        const draggable = Draggable.create(ref, {
          type: "x,y",
          bounds: "body",
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          edgeResistance: 0.65,
          dragResistance: 0.05,
          allowEventDefault: true,
          allowContextMenu: true,
          onClick: function () {
            gsap.set(this.target, {
              zIndex: getNextZIndex(),
            });
          },
          onDragStart: function () {
            gsap.to(this.target, {
              scale: 1.1,
              duration: 0.2,
              zIndex: getNextZIndex(),
            });
          },
          onDragEnd: function () {
            gsap.to(this.target, {
              scale: 1,
              duration: 0.2,
            });
          },
        })[0];

        draggableInstances.current[index] = draggable;
      });
    };

    // Call createDraggables immediately
    createDraggables();

    const handleResize = () => {
      imageRefs.current.forEach((ref) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
          gsap.to(ref, {
            x: windowWidth - rect.width - 20,
            duration: 0.3,
          });
        }
        if (rect.bottom > windowHeight) {
          gsap.to(ref, {
            y: windowHeight - rect.height - 20,
            duration: 0.3,
          });
        }
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      draggableInstances.current.forEach((instance) => instance?.kill());
      clearAllTimeouts(); // Clean up any pending timeouts
    };
  }, []); // Empty dependency array to run only once on mount

  // Helper to keep regular images below Theme button (Theme button z-index = 550)
  const getNextZIndex = () => {
    // Cycle between 1 and 500
    zIndexCounter.current = (zIndexCounter.current % 500) + 1;
    return zIndexCounter.current;
  };

  return (
    <>
      {selectedImage === null && showWorkButton && (
        <>
          <button onClick={toggleMenu} className={styles.workButton}>
            {isVisible ? "Close" : "Work"}
          </button>
          <div
            className={`${styles.buttonContainer} ${
              isMenuOpen ? styles.open : ""
            }`}
          >
            <button onClick={shuffleImages} className={styles.shuffleButton}>
              Shuffle
            </button>
          </div>
        </>
      )}

      <div
        className={`${styles.imageContainer} ${
          isVisible ? styles.visible : ""
        }`}
        style={{ pointerEvents: selectedImage !== null ? "auto" : "none" }}
      >
        {selectedImage !== null && (
          <>
            <div
              className={styles.backdrop}
              onClick={() => {
                handleDetailClick(selectedImage, { stopPropagation: () => {} });
              }}
            />
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={() => navigateImage("prev")}
            >
              ←
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() => navigateImage("next")}
            >
              →
            </button>
            <div className={styles.imageInfo}>
              <h2>{images[selectedImage].title}</h2>
              <p>{images[selectedImage].description}</p>
              <div className={styles.imageMetadata}>
                <p>Year: {images[selectedImage].year}</p>
                <p>Tech: {images[selectedImage].technologies}</p>
                {images[selectedImage].link && (
                  <a
                    href={images[selectedImage].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    View Project →
                  </a>
                )}
              </div>
            </div>
          </>
        )}
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={(el) => (imageRefs.current[index] = el)}
            className={`${styles.imageWrapper} ${
              selectedImage === index ? styles.selected : ""
            }`}
          >
            <span
              className={styles.detailButton}
              onClick={(e) => handleDetailClick(index, e)}
              onTouchEnd={(e) => handleDetailClick(index, e)}
              role="button"
              tabIndex={0}
            >
              {selectedImage === index ? "close" : "< more info"}
            </span>
            <Image
              src={image.url}
              alt={`Image ${image.id}`}
              className={styles.image}
              width={200}
              height={200}
              priority={index < 4}
              quality={75}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ImageGallery;
