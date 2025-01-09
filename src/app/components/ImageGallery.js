"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import images from "../images";
import styles from "../styles/imageGallery.module.css";

const ImageGallery = () => {
  const imageRefs = useRef([]);
  const draggableInstances = useRef([]);
  const zIndexCounter = useRef(1);
  const [isVisible, setIsVisible] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

  const handleDetailClick = (index, e) => {
    e.stopPropagation();

    if (selectedImage === index) {
      // If clicking the same image, minimize it
      gsap.to(imageRefs.current[index], {
        x: getRandomPosition().x,
        y: getRandomPosition().y,
        scale: 1,
        rotation: Math.random() * 30 - 15,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setSelectedImage(null);
          draggableInstances.current[index].enable();
        },
      });
    } else {
      // If there's already a selected image, minimize it first
      if (selectedImage !== null) {
        gsap.to(imageRefs.current[selectedImage], {
          x: getRandomPosition().x,
          y: getRandomPosition().y,
          scale: 1,
          rotation: Math.random() * 30 - 15,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            draggableInstances.current[selectedImage].enable();
          },
        });
      }

      // Then maximize the newly selected image
      const windowCenter = {
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 100,
      };

      setSelectedImage(index);
      zIndexCounter.current += 1;

      gsap.to(imageRefs.current[index], {
        x: windowCenter.x,
        y: windowCenter.y,
        scale: 3,
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
  };

  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const createDraggables = () => {
      draggableInstances.current.forEach((instance) => instance?.kill());
      draggableInstances.current = [];

      imageRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const pos = getRandomPosition();
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
          onClick: function () {
            zIndexCounter.current += 1;
            gsap.set(this.target, {
              zIndex: zIndexCounter.current,
            });
          },
        })[0];

        draggableInstances.current.push(draggable);
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
  }, []);

  return (
    <>
      <button onClick={toggleMenu} className={styles.workButton}>
        Work
      </button>
      <div
        className={`${styles.buttonContainer} ${isMenuOpen ? styles.open : ""}`}
      >
        <button onClick={shuffleImages} className={styles.shuffleButton}>
          Shuffle
        </button>
        <button onClick={toggleImages} className={styles.hideButton}>
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      <div className={styles.galleryContainer}>
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
