"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/musicPlayer.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import songs from "../../songs"; // Import the songs array

const MusicPlayer = () => {
  const containerRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Track current song
  const [currentTime, setCurrentTime] = useState(0); // Track current playback time
  const [duration, setDuration] = useState(0); // Track song duration
  const draggableInstance = useRef(null);

  const currentSong = songs[currentSongIndex]; // Get the current song

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
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((prev) => !prev);
  };

  const nextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((prevIndex) =>
      prevIndex === 0 ? songs.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      };

      audio.addEventListener("timeupdate", updateProgress);

      // Remove the event listener on cleanup
      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load(); // Load the new song
      setCurrentTime(0); // Reset current time
      setDuration(0); // Reset duration
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Playback failed:", error);
          });
        }
      }
    }
  }, [currentSongIndex]); // Update audio source when the song changes

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;

    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressBarWidth) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSongEnd = () => {
    nextSong(); // This will automatically play the next song since we removed setIsPlaying(false) earlier
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Check if the component is outside the viewport
        if (rect.right > windowWidth) {
          gsap.to(containerRef.current, {
            x: windowWidth - rect.width - 20, // 20px padding from edge
            duration: 0.3,
          });
        }
        if (rect.bottom > windowHeight) {
          gsap.to(containerRef.current, {
            y: windowHeight - rect.height - 20,
            duration: 0.3,
          });
        }
        if (rect.left < 0) {
          gsap.to(containerRef.current, {
            x: 20, // 20px padding from left edge
            duration: 0.3,
          });
        }
        if (rect.top < 0) {
          gsap.to(containerRef.current, {
            y: 20,
            duration: 0.3,
          });
        }
      }
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.musicContainer} ${
        isMinimized ? styles.minimizedContainer : ""
      }`}
    >
      {/* Audio Element - Move outside conditional rendering */}
      <audio ref={audioRef} src={currentSong.link} onEnded={handleSongEnd} />

      {/* Minimize Button */}
      <div className={styles.greenCircle} onClick={toggleMinimized}></div>

      {/* Minimized State */}
      {isMinimized ? (
        <div className={styles.minimizedContent}>
          <span className={styles.minimizedText}>{currentSong.name}</span>
        </div>
      ) : (
        <>
          {/* Song Info */}
          <div className={styles.songDetails}>
            <h3 className={styles.songTitle}>{currentSong.name}</h3>
            <p className={styles.songArtist}>{currentSong.artist}</p>
          </div>

          {/* Progress Bar */}
          <div
            className={styles.progressBar}
            onClick={handleProgressClick}
            style={{ cursor: "pointer" }} // Add cursor pointer
          >
            <div
              className={styles.progress}
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            ></div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              aria-label="Previous"
              onClick={prevSong}
            >
              ⏮
            </button>
            <button
              className={`${styles.controlButton} ${styles.playButton}`}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              className={styles.controlButton}
              aria-label="Next"
              onClick={nextSong}
            >
              ⏭
            </button>
          </div>

          {/* Time */}
          <div className={styles.timeInfo}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
