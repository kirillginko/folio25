"use client";
import React, { useRef, useEffect, useCallback, useMemo } from "react";
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
  const videoRefs = useRef(new Map());
  const [isVisible, setIsVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const originalPositions = useRef(new Map());
  const lastKnownPositions = useRef(new Map());
  const isAnimatingComponents = useRef(false);
  const animationTimeouts = useRef([]);
  const isGalleryClosing = useRef(false);
  const isAnimating = useRef(false); // Prevent overlapping animations
  const hoverTimeouts = useRef(new Map()); // Debounce hover events

  const {
    setShowAbout,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
    setShowAnalogClock,
    showWorkButton,
    setActiveComponent,
  } = useGlobalState();

  // Memoized calculations for better performance
  const windowCenter = useMemo(
    () => ({
      x: (window.innerWidth - 200) / 2,
      y: (window.innerHeight - 200) / 2,
    }),
    []
  );

  const getScaleForScreen = useMemo(
    () => (window.innerWidth <= 768 ? 1.2 : 2.5), // Reduced from 3 to 2.5 for better performance
    []
  );

  // Add mobile detection helper
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  // Optimized video controls with reduced operations
  const handleVideoPlay = useCallback(
    (videoElement, shouldUnmute = false) => {
      if (!videoElement) return;

      // Use requestAnimationFrame for smoother video operations
      requestAnimationFrame(() => {
        try {
          // Only reset currentTime if video is not already playing from start
          if (videoElement.currentTime > 0.1) {
            videoElement.currentTime = 0;
          }

          if (shouldUnmute) {
            videoElement.muted = false;
          }

          // On mobile, ensure video is loaded first
          if (isMobile && videoElement.readyState < 2) {
            // For newer videos, use a more aggressive loading approach
            const videoSrc = videoElement.src;
            const isNewerVideo =
              videoSrc.includes("v1752") || videoSrc.includes("q_auto:low");

            if (isNewerVideo) {
              // Force load with timeout for newer videos
              videoElement.load();
              const loadTimeout = setTimeout(() => {
                videoElement.removeEventListener("loadeddata", onLoadedData);
                // Try to play anyway even if not fully loaded
                videoElement.play().catch(() => {
                  console.log("Mobile video play failed for newer video");
                });
              }, 2000);

              const onLoadedData = () => {
                clearTimeout(loadTimeout);
                videoElement.removeEventListener("loadeddata", onLoadedData);
                videoElement.play().catch(() => {
                  // Silently handle mobile video play error
                });
              };
              videoElement.addEventListener("loadeddata", onLoadedData);
            } else {
              // Original logic for older videos
              videoElement.load();
              const onLoadedData = () => {
                videoElement.removeEventListener("loadeddata", onLoadedData);
                videoElement.play().catch(() => {
                  // Silently handle mobile video play error
                });
              };
              videoElement.addEventListener("loadeddata", onLoadedData);
            }
            return;
          }

          // Ensure video is in a playable state
          if (videoElement.readyState >= 2) {
            // HAVE_CURRENT_DATA
            videoElement.play().catch(() => {
              // Fallback: try playing after a short delay
              setTimeout(() => {
                videoElement.play().catch(() => {
                  // Silently handle retry failure
                });
              }, 100);
            });
          } else {
            // Wait for video to be ready
            const onCanPlay = () => {
              videoElement.removeEventListener("canplay", onCanPlay);
              videoElement.play().catch(() => {
                // Silently handle video play error
              });
            };
            videoElement.addEventListener("canplay", onCanPlay);
          }
        } catch (error) {
          console.log("Video play error:", error);
        }
      });
    },
    [isMobile]
  );

  const handleVideoPause = useCallback((videoElement) => {
    if (!videoElement) return;

    requestAnimationFrame(() => {
      try {
        videoElement.pause();
        // Only reset currentTime if we're not in an expanded state
        // This prevents stuttering when pausing expanded videos
        if (!videoElement.classList?.contains("expanded-video")) {
          videoElement.currentTime = 0;
        }
        // Only reset to muted if not expanded
        if (!videoElement.classList?.contains("expanded-video")) {
          videoElement.muted = true;
        }
      } catch {
        // Silently handle video pause error
      }
    });
  }, []);

  // Batch state updates for better performance
  const batchStateUpdate = useCallback((updates) => {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  }, []);

  // Performant hover video controls with debouncing
  const handleVideoHoverPlay = useCallback(
    (index) => {
      // Only play on hover if not selected and is a video
      if (selectedImage === index || images[index].type !== "video") return;

      const video = videoRefs.current.get(index);
      if (!video) return;

      // Don't restart if already playing
      if (!video.paused) return;

      // Clear any existing timeout for this video
      const existingTimeout = hoverTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Debounce the play operation
      const playTimeout = setTimeout(() => {
        // Double-check that we're still not selected (in case state changed)
        if (selectedImage !== index) {
          // Only play if video is ready to avoid stutter
          if (video.readyState >= 2) {
            handleVideoPlay(video, false); // Keep muted on hover
          }
        }
        hoverTimeouts.current.delete(index);
      }, 100); // Slightly longer delay to prevent rapid triggers

      hoverTimeouts.current.set(index, playTimeout);
    },
    [selectedImage, handleVideoPlay]
  );

  const handleVideoHoverPause = useCallback(
    (index) => {
      // Only pause hover videos if not selected
      if (selectedImage === index || images[index].type !== "video") return;

      const video = videoRefs.current.get(index);
      if (!video) return;

      // Clear any pending play timeout
      const existingTimeout = hoverTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        hoverTimeouts.current.delete(index);
      }

      // Only pause if video is not selected and is actually playing
      if (selectedImage !== index && !video.paused) {
        handleVideoPause(video);
      }
    },
    [selectedImage, handleVideoPause]
  );

  // Add touch event handlers for mobile video interaction
  const handleVideoTouch = useCallback(
    (index) => {
      // Only handle touch for videos
      if (images[index].type !== "video") return;

      const video = videoRefs.current.get(index);
      if (!video) return;

      // If the video is paused, play it; otherwise pause it
      if (video.paused) {
        handleVideoPlay(video, false); // Keep muted on touch preview
      } else {
        handleVideoPause(video);
      }
    },
    [handleVideoPlay, handleVideoPause]
  );

  // Simplified animation helpers
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
    const allDraggables = document.querySelectorAll(
      '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
    );

    allDraggables.forEach((element, index) => {
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

      lastKnownPositions.current.set(elementKey, {
        x: currentX,
        y: currentY,
        rotation: 0,
        isMusicPlayer: isMusicPlayer,
      });

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
          rotation: 0,
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
    const side = Math.floor(Math.random() * 4);
    const padding = 300;

    switch (side) {
      case 0:
        return {
          x: Math.random() * window.innerWidth,
          y: -padding,
        };
      case 1:
        return {
          x: window.innerWidth + padding,
          y: Math.random() * window.innerHeight,
        };
      case 2:
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + padding,
        };
      case 3:
        return {
          x: -padding,
          y: Math.random() * window.innerHeight,
        };
    }
  };

  const getComponentOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4);
    const padding = Math.max(window.innerWidth, window.innerHeight) + 500;

    switch (side) {
      case 0:
        return {
          x: Math.random() * window.innerWidth,
          y: -padding,
        };
      case 1:
        return {
          x: window.innerWidth + padding,
          y: Math.random() * window.innerHeight,
        };
      case 2:
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + padding,
        };
      case 3:
        return {
          x: -padding,
          y: Math.random() * window.innerHeight,
        };
    }
  };

  const flyComponentsOffScreen = () => {
    clearAllTimeouts();
    isAnimatingComponents.current = true;
    isGalleryClosing.current = false;
    storeCurrentPositions();
    setActiveComponent(null);

    addTimeout(() => {
      if (!isAnimatingComponents.current || isGalleryClosing.current) {
        return;
      }

      const allDraggables = document.querySelectorAll(
        '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
      );

      allDraggables.forEach((element) => {
        if (element.closest(".interactive-element")) {
          return;
        }

        if (
          element.className.toLowerCase().includes("email") ||
          element.id?.toLowerCase().includes("email")
        ) {
          return;
        }

        const pos = getComponentOffScreenPosition();

        gsap.to(element, {
          x: pos.x,
          y: pos.y,
          duration: 1.0, // Slightly reduced
          ease: "power2.out",
        });
      });
    }, 100);
  };

  const handleThemeButtonForImage = (hide) => {
    const themeButton = document.querySelector('[class*="flowerContainer"]');
    if (themeButton) {
      // Use simple opacity change instead of GSAP for better performance
      themeButton.style.transition = "opacity 0.2s ease";
      themeButton.style.opacity = hide ? "0" : "1";
    }
  };

  const immediatelyRestoreComponents = () => {
    clearAllTimeouts();
    isAnimatingComponents.current = false;
    isGalleryClosing.current = true;

    const allDraggables = document.querySelectorAll(
      '[class*="draggableWrapper"], [class*="musicPlayerWrapper"]'
    );

    allDraggables.forEach((element, index) => {
      if (element.closest(".interactive-element")) {
        return;
      }

      if (
        element.className.toLowerCase().includes("email") ||
        element.id?.toLowerCase().includes("email")
      ) {
        return;
      }

      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.display === "none") {
        return;
      }

      const elementKey = element.id || `element-${index}`;
      const lastKnownPos = lastKnownPositions.current.get(elementKey);
      const isMusicPlayer = element.className
        .toLowerCase()
        .includes("musicplayer");

      gsap.killTweensOf(element);

      if (lastKnownPos) {
        const duration = isMusicPlayer ? 0.8 : 0.5; // Reduced durations

        gsap.to(element, {
          x: lastKnownPos.x,
          y: lastKnownPos.y,
          rotation: 0,
          duration: duration,
          ease: "power2.out",
          onComplete: () => {
            if (isMusicPlayer) {
              element.classList.add("position-restoring");

              addTimeout(() => {
                gsap.set(element, {
                  x: lastKnownPos.x,
                  y: lastKnownPos.y,
                });

                addTimeout(() => {
                  element.classList.remove("position-restoring");
                }, 200);
              }, 50);
            }
          },
        });
      } else {
        const originalPos = originalPositions.current.get(elementKey);
        if (originalPos) {
          gsap.to(element, {
            x: originalPos.x,
            y: originalPos.y,
            rotation: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {},
          });
        }
      }
    });
  };

  const shuffleImages = () => {
    if (!isVisible) {
      setIsVisible(true);
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
        duration: 0.5, // Reduced duration
        ease: "power2.out",
      });
    });
  };

  const toggleImages = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);

    imageRefs.current.forEach((ref) => {
      if (!ref) return;

      const pos = isVisible ? getOffScreenPosition() : getRandomPosition();

      gsap.to(ref, {
        x: pos.x,
        y: pos.y,
        rotation: Math.random() * 30 - 15,
        duration: 0.5, // Reduced duration
        ease: "power2.out",
        stagger: 0.03, // Reduced stagger
      });
    });

    if (newVisibility) {
      isGalleryClosing.current = false;
      flyComponentsOffScreen();
    } else {
      isGalleryClosing.current = true;

      // Batch state updates
      batchStateUpdate([
        () => setShowAbout(true),
        () => setShowBrushCanvas(true),
        () => setShowMusicPlayer(true),
        () => setShowEmail(true),
        () => setShowAnalogClock(true),
        () => setActiveComponent(null),
      ]);

      addTimeout(() => {
        immediatelyRestoreComponents();
      }, 50);

      addTimeout(() => {
        window.dispatchEvent(new CustomEvent("recreateDraggables"));
      }, 200);
    }
  };

  const handleDetailClick = (index, e) => {
    // Prevent overlapping animations
    if (isAnimating.current) return;

    e = e || { stopPropagation: () => {} };
    e.stopPropagation();

    if (e.preventDefault) {
      e.preventDefault();
    }

    isAnimating.current = true;
    const media = images[index];
    const currentRef = imageRefs.current[index];

    if (selectedImage === index) {
      // Minimize - ultra-simplified animation
      const targetPos = getRandomPosition();

      // Immediately disable dragging and stop video
      draggableInstances.current[index].enable();
      if (media.type === "video") {
        const video = videoRefs.current.get(index);
        if (video) {
          video.classList.remove("expanded-video");
          handleVideoPause(video);
        }
      }

      // Single, fast animation
      gsap.to(currentRef, {
        x: targetPos.x,
        y: targetPos.y,
        scale: 1,
        rotation: Math.random() * 30 - 15,
        duration: 0.25, // Much faster
        ease: "power1.out", // Simpler easing
        onStart: () => {
          // Batch state updates
          batchStateUpdate([
            () => setSelectedImage(null),
            () => handleThemeButtonForImage(false),
            () => setActiveComponent(null),
          ]);

          if (!isVisible) {
            batchStateUpdate([
              () => setShowAbout(true),
              () => setShowBrushCanvas(true),
              () => setShowMusicPlayer(true),
              () => setShowEmail(true),
              () => setShowAnalogClock(true),
            ]);
          }
        },
        onComplete: () => {
          gsap.set(currentRef, { zIndex: 1 });
          isAnimating.current = false;
        },
      });
    } else {
      // EXPAND NEW IMAGE
      // Handle previously selected image quickly
      if (selectedImage !== null) {
        const prevRef = imageRefs.current[selectedImage];
        const prevMedia = images[selectedImage];

        if (prevMedia.type === "video") {
          const prevVideo = videoRefs.current.get(selectedImage);
          if (prevVideo) {
            prevVideo.classList.remove("expanded-video");
            handleVideoPause(prevVideo);
          }
        }

        prevRef.style.willChange = "transform";
        draggableInstances.current[selectedImage].enable();

        gsap.to(prevRef, {
          x: getRandomPosition().x,
          y: getRandomPosition().y,
          scale: 1,
          rotation: Math.random() * 30 - 15,
          duration: 0.2, // Very fast
          ease: "power1.out",
          onComplete: () => {
            prevRef.style.willChange = "auto";
            gsap.set(prevRef, { zIndex: 1 });
          },
        });
      }

      // Expand new image - simplified animation
      currentRef.style.willChange = "transform";
      draggableInstances.current[index].disable();

      // Batch state updates
      batchStateUpdate([
        () => setSelectedImage(index),
        () => setShowAbout(false),
        () => setShowBrushCanvas(false),
        () => setShowMusicPlayer(false),
        () => setShowAnalogClock(false),
        () => setActiveComponent("image"),
        () => handleThemeButtonForImage(true),
      ]);

      zIndexCounter.current += 1;

      gsap.to(currentRef, {
        x: windowCenter.x,
        y: windowCenter.y,
        scale: getScaleForScreen,
        rotation: 0,
        zIndex: zIndexCounter.current,
        duration: 0.25, // Much faster
        ease: "power1.out", // Simpler easing
        onStart: () => {
          // Clear any hover timeouts for this video first
          if (media.type === "video") {
            const existingTimeout = hoverTimeouts.current.get(index);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
              hoverTimeouts.current.delete(index);
            }
            // Mark video as expanded
            const video = videoRefs.current.get(index);
            if (video) {
              video.classList.add("expanded-video");
            }
          }
        },
        onComplete: () => {
          // Play video after animation completes for better reliability
          if (media.type === "video") {
            const video = videoRefs.current.get(index);
            if (video) {
              // Ensure video is ready for smooth playback
              if (video.readyState >= 2) {
                // Video is loaded, play immediately
                handleVideoPlay(video, true);
              } else {
                // Wait for video to load
                const onCanPlay = () => {
                  video.removeEventListener("canplay", onCanPlay);
                  handleVideoPlay(video, true);
                };
                video.addEventListener("canplay", onCanPlay);
              }
            }
          }
          isAnimating.current = false;
        },
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    toggleImages();
  };

  const navigateImage = (direction) => {
    if (selectedImage === null || isAnimating.current) return;

    const newIndex =
      direction === "next"
        ? (selectedImage + 1) % images.length
        : (selectedImage - 1 + images.length) % images.length;

    // Pause current video if it's a video
    const currentMedia = images[selectedImage];
    if (currentMedia.type === "video") {
      const currentVideo = videoRefs.current.get(selectedImage);
      if (currentVideo) {
        currentVideo.classList.remove("expanded-video");
        handleVideoPause(currentVideo);
      }
    }

    handleDetailClick(newIndex, { stopPropagation: () => {} });
  };

  useEffect(() => {
    if (!gsap.registerPlugin) {
      return;
    }
    gsap.registerPlugin(Draggable);

    // Capture current ref values for cleanup
    const currentHoverTimeouts = hoverTimeouts.current;

    const createDraggables = () => {
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
              scale: 1.05, // Reduced scale
              duration: 0.15, // Faster
              zIndex: getNextZIndex(),
            });
          },
          onDragEnd: function () {
            gsap.to(this.target, {
              scale: 1,
              duration: 0.15, // Faster
              onComplete: () => {},
            });
          },
        })[0];

        draggableInstances.current[index] = draggable;
      });
    };

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
            duration: 0.2, // Faster
          });
        }
        if (rect.bottom > windowHeight) {
          gsap.to(ref, {
            y: windowHeight - rect.height - 20,
            duration: 0.2, // Faster
          });
        }
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      draggableInstances.current.forEach((instance) => instance?.kill());
      clearAllTimeouts();
      // Clean up hover timeouts using captured ref value
      currentHoverTimeouts.forEach((timeout) => clearTimeout(timeout));
      currentHoverTimeouts.clear();
    };
  }, []);

  const getNextZIndex = () => {
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
            onMouseEnter={() => handleVideoHoverPlay(index)}
            onMouseLeave={() => handleVideoHoverPause(index)}
            onTouchStart={() => handleVideoTouch(index)}
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
            {image.type === "video" ? (
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current.set(index, el);

                    // Add expanded class for state management
                    if (selectedImage === index) {
                      el.classList.add("expanded-video");
                    } else {
                      el.classList.remove("expanded-video");
                    }

                    // Add event listeners for better video management
                    const handleLoadedData = () => {
                      // Video is loaded and ready to play
                      if (el.currentTime > 0) {
                        el.currentTime = 0;
                      }
                      console.log(`Video ${index} loaded successfully`, el.src);
                    };

                    const handleError = (e) => {
                      console.error(
                        `Video ${index} failed to load:`,
                        e,
                        el.src
                      );
                    };

                    const handleCanPlay = () => {
                      // Video is ready to play
                      console.log(`Video ${index} can play`, el.src);
                    };

                    // Remove existing listeners to prevent duplicates
                    el.removeEventListener("loadeddata", handleLoadedData);
                    el.removeEventListener("error", handleError);
                    el.removeEventListener("canplay", handleCanPlay);

                    // Add new listeners
                    el.addEventListener("loadeddata", handleLoadedData);
                    el.addEventListener("error", handleError);
                    el.addEventListener("canplay", handleCanPlay);

                    // Ensure video starts in correct state
                    el.muted = selectedImage === index ? false : true;
                    el.currentTime = 0;

                    // Force video to load on mobile
                    if (isMobile) {
                      el.load();
                    }
                  }
                }}
                src={isMobile && image.mobileUrl ? image.mobileUrl : image.url}
                poster={image.poster}
                className={styles.image}
                width={200}
                height={200}
                loop
                muted={selectedImage !== index}
                playsInline
                preload={isMobile ? "none" : "metadata"}
                loading="lazy"
                controls={false}
                webkit-playsinline="true"
                x5-playsinline="true"
                style={{
                  objectFit: "cover",
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Image
                src={image.url}
                alt={`Image ${image.id}`}
                className={styles.image}
                width={200}
                height={200}
                priority={index < 4}
                quality={75}
                loading={index < 4 ? "eager" : "lazy"}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ImageGallery;
