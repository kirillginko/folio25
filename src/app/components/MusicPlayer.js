"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/musicPlayer.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import songs from "../../songs"; // Import the songs array
import Marquee from "react-fast-marquee";
import AudioVisualizer from "./AudioVisualizer";

const MusicPlayer = () => {
  const containerRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Track current song
  const [currentTime, setCurrentTime] = useState(0); // Track current playback time
  const [duration, setDuration] = useState(0); // Track song duration
  const draggableInstance = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const animationFrameRef = useRef(null);

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
        edgeResistance: 0.65,
        dragResistance: 0.05,
        zIndexBoost: true,
        onDragStart: function () {
          gsap.to(this.target, {
            scale: 1.1,
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

  const togglePlay = async () => {
    if (!audioRef.current || !audioContext) return;

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
      setIsPlaying(!isPlaying);
      console.log("Playback state toggled:", !isPlaying);
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
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
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.load(); // Load the new song
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Playback started successfully");
          })
          .catch((error) => {
            console.error("Playback failed:", error);
          });
      }
    }
  }, [currentSongIndex]);

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

  useEffect(() => {
    if (!audioRef.current || audioContext) return;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyzerNode = context.createAnalyser();
      analyzerNode.fftSize = 2048;
      analyzerNode.smoothingTimeConstant = 0.8;

      const source = context.createMediaElementSource(audioRef.current);
      source.connect(analyzerNode);
      analyzerNode.connect(context.destination);

      setAudioContext(context);
      setAnalyser(analyzerNode);
    } catch (error) {
      console.error("Error setting up audio context:", error);
    }
  }, []);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const analyzeFrequency = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      // Calculate average frequency for different ranges
      // Sub-bass (20-60 Hz)
      const subBass = dataArray.slice(1, 3).reduce((a, b) => a + b) / 2;

      // Bass (60-250 Hz)
      const bass = dataArray.slice(3, 12).reduce((a, b) => a + b) / 9;

      // Low Mids (250-500 Hz)
      const lowMids = dataArray.slice(12, 24).reduce((a, b) => a + b) / 12;

      // Mids (500-2000 Hz)
      const mids = dataArray.slice(24, 96).reduce((a, b) => a + b) / 72;

      // High Mids (2000-4000 Hz)
      const highMids = dataArray.slice(96, 192).reduce((a, b) => a + b) / 96;

      // Presence (4000-6000 Hz)
      const presence = dataArray.slice(192, 288).reduce((a, b) => a + b) / 96;

      // Brilliance (6000-20000 Hz)
      const brilliance =
        dataArray.slice(288, 1024).reduce((a, b) => a + b) / 736;

      // Calculate overall volume (RMS of all frequencies)
      const volume = Math.sqrt(
        dataArray.reduce((a, b) => a + b * b, 0) / dataArray.length
      );

      console.log("Frequency Analysis:", {
        subBass: Math.round(subBass),
        bass: Math.round(bass),
        lowMids: Math.round(lowMids),
        mids: Math.round(mids),
        highMids: Math.round(highMids),
        presence: Math.round(presence),
        brilliance: Math.round(brilliance),
        volume: Math.round(volume),
      });

      animationFrameRef.current = requestAnimationFrame(analyzeFrequency);
    };

    analyzeFrequency();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isPlaying]);

  useEffect(() => {
    // Animation for expanding/minimizing
    if (containerRef.current) {
      const container = containerRef.current.querySelector(
        `.${styles.musicContainer}`
      );
      if (!container) return;

      const tl = gsap.timeline();

      if (isMinimized) {
        // Minimize animation - making it smaller
        tl.to(container, {
          width: "150px", // Changed from 150px
          height: "40px",
          duration: 0.3,
          ease: "power2.inOut",
        });

        // Only animate content if it exists
        const minimizedContent = container.querySelector(
          `.${styles.minimizedContent}`
        );
        if (minimizedContent) {
          tl.fromTo(
            minimizedContent,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.2 },
            "-=0.1"
          );
        }
      } else {
        // Expand animation - making it smaller
        tl.to(container, {
          width: window.innerWidth <= 640 ? "calc(100vw - 40px)" : "500px", // Changed from 600px
          height: "60px",
          duration: 0.3,
          ease: "power2.inOut",
        });

        // Only animate elements if they exist
        const elements = [
          container.querySelector(`.${styles.controls}`),
          container.querySelector(`.${styles.progressBar}`),
          container.querySelector(`.${styles.timeInfo}`),
          container.querySelector(`.${styles.songDetails}`),
        ].filter(Boolean); // Remove null values

        if (elements.length) {
          tl.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.1"
          );
        }
      }
    }
  }, [isMinimized]);

  return (
    <div
      ref={containerRef}
      className={`${styles.musicPlayerWrapper} ${
        isMinimized ? styles.minimizedContainer : ""
      }`}
    >
      {!isMinimized && (
        <div className={styles.visualizerWrapper}>
          <div className={styles.visualizerContainer}>
            {analyser && <AudioVisualizer analyserNode={analyser} />}
          </div>
        </div>
      )}

      <div
        className={`${styles.musicContainer} ${
          isMinimized ? styles.minimizedContainer : ""
        }`}
      >
        <audio
          ref={audioRef}
          src={currentSong.link}
          onEnded={handleSongEnd}
          preload="auto"
          crossOrigin="anonymous"
        />
        <div className={styles.greenCircle} onClick={toggleMinimized}></div>
        {/* Minimized State with Marquee */}
        {isMinimized ? (
          <div className={styles.minimizedContent}>
            <Marquee gradient={false} speed={30} pauseOnHover={true}>
              <span className={styles.minimizedText}>
                <span className={styles.artistName}>{currentSong.artist}</span>
                &nbsp;&nbsp;-&nbsp;&nbsp;
                <span className={styles.songName}>{currentSong.name}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </Marquee>
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
    </div>
  );
};

export default MusicPlayer;
