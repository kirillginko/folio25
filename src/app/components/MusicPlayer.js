"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/musicPlayer.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

const MusicPlayer = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const draggableInstance = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const createDraggable = () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: isMinimized ? 0.85 : 0.65,
        dragResistance: isMinimized ? 0.1 : 0.05,
        zIndexBoost: true,
        onDragStart: function () {
          gsap.to(this.target, {
            scale: isMinimized ? 1.05 : 1.1,
            duration: 0.2,
          });
        },
        onDragEnd: function () {
          gsap.to(this.target, { scale: 1, duration: 0.2 });
        },
      })[0];
    };

    createDraggable();

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [isMinimized]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.musicContainer} ${
        isMinimized ? styles.minimizedContainer : styles.normalContainer
      }`}
    >
      {/* Minimize Button */}
      <div className={styles.greenCircle} onClick={toggleMinimized}></div>

      {/* Minimized State */}
      {isMinimized ? (
        <div className={styles.minimizedContent}>
          <span className={styles.minimizedText}>Now Playing</span>
        </div>
      ) : (
        <>
          {/* Song Info */}
          <div className={styles.songDetails}>
            <h3 className={styles.songTitle}>Song Title</h3>
            <p className={styles.songArtist}>Artist Name</p>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div className={styles.progress}></div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.controlButton} aria-label="Previous">
              ←
            </button>
            <button
              className={`${styles.controlButton} ${styles.playButton}`}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button className={styles.controlButton} aria-label="Next">
              →
            </button>
          </div>

          {/* Time */}
          <div className={styles.timeInfo}>
            <span>0:00</span>
            <span>3:45</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
