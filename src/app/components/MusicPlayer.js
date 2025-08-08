"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/musicPlayer.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import songs from "../../songs"; // Import the songs array
import Marquee from "react-fast-marquee";
import AudioVisualizer from "./AudioVisualizer";
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";

const MusicPlayer = () => {
  const containerRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Track current song
  const [currentTime, setCurrentTime] = useState(0); // Track current playback time
  const [duration, setDuration] = useState(0); // Track song duration
  const draggableInstance = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const animationFrameRef = useRef(null);
  const { showMusicPlayer, isMusicPlayerMinimized, setIsMusicPlayerMinimized } =
    useGlobalState();

  const currentSong = songs[currentSongIndex]; // Get the current song

  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const handleRecreateDraggables = () => {
      // Force recreation of draggable when gallery interaction is complete
      // Kill any existing draggable immediately
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      // Create new draggable with a small delay
      setTimeout(() => {
        createDraggable();
      }, 50);
    };

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

    // Add event listener for forced recreation
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
  }, [isMusicPlayerMinimized, showMusicPlayer]);

  const toggleMinimized = () => {
    setIsMusicPlayerMinimized((prev) => !prev);
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
  }, [currentSongIndex, isPlaying]); // Added isPlaying back to fix ESLint warning

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Track if we just handled a touch event to prevent duplicate click events
  const lastTouchTime = useRef(0);

  const handleProgressClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // On mobile, prevent synthetic click events after touch
    if (e.type === 'click') {
      const now = Date.now();
      if (now - lastTouchTime.current < 500) {
        // This is likely a synthetic click event after touch, ignore it
        return;
      }
    }
    
    if (e.type === 'touchend') {
      lastTouchTime.current = Date.now();
    }
    
    if (!audioRef.current || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clickPosition;
    if (e.type === 'touchstart' || e.type === 'touchend') {
      const touch = e.touches[0] || e.changedTouches[0];
      clickPosition = touch.clientX - rect.left;
    } else {
      clickPosition = e.clientX - rect.left;
    }
    
    // Ensure click position is within bounds
    clickPosition = Math.max(0, Math.min(clickPosition, rect.width));
    
    const progressBarWidth = rect.width;
    const percentage = clickPosition / progressBarWidth;
    const newTime = percentage * duration;
    
    // Ensure newTime is valid
    if (newTime >= 0 && newTime <= duration) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
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
        const padding = 20;

        // Calculate new position
        let newX = gsap.getProperty(containerRef.current, "x");
        let newY = gsap.getProperty(containerRef.current, "y");

        // Check right boundary
        if (rect.right > windowWidth) {
          newX = windowWidth - rect.width - padding;
        }

        // Check bottom boundary
        if (rect.bottom > windowHeight) {
          newY = windowHeight - rect.height - padding;
        }

        // Check left boundary
        if (rect.left < padding) {
          newX = padding;
        }

        // Check top boundary
        if (rect.top < padding) {
          newY = padding;
        }

        // Animate to new position if needed
        if (newX !== rect.x || newY !== rect.y) {
          gsap.to(containerRef.current, {
            x: newX,
            y: newY,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    // Initial positioning
    const initializePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Position in bottom right corner by default
        gsap.set(containerRef.current, {
          x: windowWidth - rect.width - 40,
          y: windowHeight - rect.height - 200,
        });
      }
    };

    // Set initial position and add resize listener
    initializePosition();
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
  }, [audioContext]);

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

      // Frequency analysis for visualizer (currently unused but available for future features)
      // Note: These calculations are kept for potential future visualizer enhancements

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
    if (containerRef.current) {
      const container = containerRef.current.querySelector(
        `.${styles.musicContainer}`
      );
      if (!container) return;

      const tl = gsap.timeline();

      if (isMusicPlayerMinimized) {
        // Minimize animation
        tl.to(container, {
          width: "150px",
          height: "40px",
          duration: 0.3,
          ease: "power2.inOut",
        });

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
        // Expand animation
        tl.to(container, {
          width: "500px",
          height: "60px",
          duration: 0.3,
          ease: "power2.inOut",
        });

        const elements = [
          container.querySelector(`.${styles.controls}`),
          container.querySelector(`.${styles.progressBar}`),
          container.querySelector(`.${styles.timeInfo}`),
          container.querySelector(`.${styles.songDetails}`),
        ].filter(Boolean);

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
  }, [isMusicPlayerMinimized]);

  return (
    <div style={{ display: showMusicPlayer ? "block" : "none" }}>
      <div ref={containerRef} className={styles.musicPlayerWrapper}>
        {!isMusicPlayerMinimized && (
          <div className={styles.visualizerWrapper}>
            <div className={styles.visualizerContainer}>
              {analyser && <AudioVisualizer analyserNode={analyser} />}
            </div>
          </div>
        )}

        <div
          className={`${styles.musicContainer} ${
            isMusicPlayerMinimized ? styles.minimizedContainer : ""
          }`}
        >
          <audio
            ref={audioRef}
            src={currentSong.link}
            onEnded={handleSongEnd}
            preload="auto"
            crossOrigin="anonymous"
          />
          <div className={styles.expandButton} onClick={toggleMinimized}>
            {isMusicPlayerMinimized ? (
              <BsArrowsAngleExpand className={styles.toggleIcon} />
            ) : (
              <BsArrowsAngleContract className={styles.toggleIcon} />
            )}
          </div>
          {isMusicPlayerMinimized ? (
            <div className={styles.minimizedContent}>
              <Marquee gradient={false} speed={30} pauseOnHover={true}>
                <span className={styles.minimizedText}>
                  <span className={styles.artistName}>
                    {currentSong.artist}
                  </span>
                  &nbsp;&nbsp;-&nbsp;&nbsp;
                  <span className={styles.songName}>{currentSong.name}</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </Marquee>
            </div>
          ) : (
            <>
              <div className={styles.songDetails}>
                <h3 className={styles.songTitle}>{currentSong.name}</h3>
                <p className={styles.songArtist}>{currentSong.artist}</p>
              </div>

              <div
                className={styles.progressBar}
                onClick={handleProgressClick}
                onTouchEnd={handleProgressClick}
                style={{ 
                  cursor: "pointer", 
                  touchAction: "manipulation",
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 1000
                }}
              >
                <div
                  className={styles.progress}
                  style={{
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
                  }}
                ></div>
              </div>

              <div className={styles.controls}>
                <button
                  className={styles.controlButton}
                  aria-label="Previous"
                  onClick={prevSong}
                >
                  <IoIosSkipBackward size={20} />
                </button>
                <button
                  className={`${styles.controlButton} ${styles.playButton}`}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <IoPauseSharp size={20} />
                  ) : (
                    <IoPlaySharp size={20} />
                  )}
                </button>
                <button
                  className={styles.controlButton}
                  aria-label="Next"
                  onClick={nextSong}
                >
                  <IoIosSkipForward size={20} />
                </button>
              </div>

              <div className={styles.timeInfo}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
