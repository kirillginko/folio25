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

  const getRandomPosition = () => {
    const padding = 100;
    return {
      x: Math.random() * (window.innerWidth - padding * 2) + padding,
      y: Math.random() * (window.innerHeight - padding * 2) + padding,
    };
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
        });

        const draggable = Draggable.create(ref, {
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
              scale: 1.1,
              duration: 0.2,
              zIndex: 100,
            });
          },
          onDragEnd: function () {
            gsap.to(this.target, {
              scale: 1,
              duration: 0.2,
              zIndex: 10,
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
    <div className={styles.galleryContainer}>
      {images.map((image, index) => (
        <div
          key={image.id}
          ref={(el) => (imageRefs.current[index] = el)}
          className={styles.imageWrapper}
        >
          <Image
            src={image.url}
            alt={`Image ${image.id}`}
            className={styles.image}
            width={200}
            height={200}
            priority={index < 4} // Load first 4 images immediately
            quality={75}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
