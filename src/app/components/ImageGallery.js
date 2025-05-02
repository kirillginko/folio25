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
  const {
    setShowAbout,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
    showWorkButton,
    setActiveComponent,
  } = useGlobalState();

  const getRandomPosition = () => {
    const padding = 100;
    const imageSize = 220;

    return {
      x: Math.random() * (window.innerWidth - imageSize),
      y: Math.random() * (window.innerHeight - imageSize),
    };
  };

  const getOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const padding = 300; // Distance off screen

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

  const shuffleImages = () => {
    if (!isVisible) {
      // If images are hidden, bring them back first
      setIsVisible(true);
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
    setIsVisible(!isVisible);

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
  };

  const getWindowCenter = () => {
    return {
      x: (window.innerWidth - 200) / 2, // 200 is the base image width
      y: (window.innerHeight - 200) / 2, // 200 is the base image height
    };
  };

  const handleDetailClick = (index, e) => {
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

          // Restore other components with a delay to ensure animations complete
          setTimeout(() => {
            setShowAbout(true);
            setShowBrushCanvas(true);
            setShowMusicPlayer(true);
            setShowEmail(true);

            // Delay the activeComponent reset to ensure position restoration works
            setTimeout(() => {
              setActiveComponent(null);
            }, 50);
          }, 50);
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
        });
      }

      const windowCenter = getWindowCenter();
      setSelectedImage(index);
      setShowAbout(false);
      setShowBrushCanvas(false);
      setShowMusicPlayer(false);
      setActiveComponent("image");
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
            zIndexCounter.current += 1;
            gsap.set(this.target, {
              zIndex: zIndexCounter.current,
            });
          },
          onDragStart: function () {
            zIndexCounter.current += 1;
            gsap.to(this.target, {
              scale: 1.1,
              duration: 0.2,
              zIndex: zIndexCounter.current,
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
    };
  }, []); // Empty dependency array to run only once on mount

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
              onClick={(e) => {
                handleDetailClick(selectedImage, { stopPropagation: () => {} });
                setShowAbout(false);
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
