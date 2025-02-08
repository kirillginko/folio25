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
  const { showMusicPlayer, isMusicPlayerMinimized, setIsMusicPlayerMinimized } =
    useGlobalState();

  // Use refs for AudioContext and AnalyserNode since they don't need to trigger re-renders
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Add new ref for tracking position
  const positionRef = useRef({ x: 0, y: 0 });

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
          // Store the current position
          positionRef.current = {
            x: this.x,
            y: this.y,
          };
        },
      })[0];
    };

    createDraggable();

    // Add resize handler
    const handleResize = () => {
      if (!containerRef.current || !draggableInstance.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Check if the player is outside viewport and adjust if necessary
      let newX = positionRef.current.x;
      let newY = positionRef.current.y;

      if (newX + containerRect.width > windowWidth) {
        newX = windowWidth - containerRect.width;
      }
      if (newX < 0) {
        newX = 0;
      }
      if (newY + containerRect.height > windowHeight) {
        newY = windowHeight - containerRect.height;
      }
      if (newY < 0) {
        newY = 0;
      }

      // Update position
      gsap.set(container, { x: newX, y: newY });
      positionRef.current = { x: newX, y: newY };
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [isMusicPlayerMinimized]);

  const toggleMinimized = () => {
    const container = containerRef.current;
    if (!container) return;

    const content = container.querySelector(`.${styles.songDetails}`);
    const controls = container.querySelector(`.${styles.controls}`);
    const timeInfo = container.querySelector(`.${styles.timeInfo}`);
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    const containerDuration = 0.15; // Even faster container animation
    const contentDuration = 0.4; // Slower content animation

    if (!isMusicPlayerMinimized) {
      // Transitioning to minimized state
      const elements = [content, controls, timeInfo, progressBar].filter(
        Boolean
      );
      if (elements.length > 0) {
        gsap
          .timeline({
            defaults: { ease: "expo.inOut" },
          })
          .to(elements, {
            opacity: 0,
            x: -20,
            duration: contentDuration,
            stagger: 0.05,
            ease: "power2.inOut",
          })
          .to(
            container,
            {
              width: "140px",
              height: "60px",
              duration: containerDuration,
              onComplete: () => setIsMusicPlayerMinimized(true),
            },
            "-=0.35"
          ); // Larger overlap so container starts shrinking while content is still fading
      } else {
        gsap.to(container, {
          width: "140px",
          height: "60px",
          duration: containerDuration,
          ease: "power2.inOut",
          onComplete: () => setIsMusicPlayerMinimized(true),
        });
      }
    } else {
      // Transitioning to expanded state
      setIsMusicPlayerMinimized(false);

      gsap.to(container, {
        width: "500px",
        height: "400px",
        duration: containerDuration,
        ease: "power2.inOut",
        onComplete: () => {
          const elements = [content, controls, timeInfo, progressBar].filter(
            Boolean
          );
          if (elements.length > 0) {
            gsap.from(elements, {
              opacity: 0,
              x: -20,
              duration: contentDuration,
              stagger: 0.05,
              ease: "power2.out",
              clearProps: "all",
            });
          }
        },
      });
    }
  };

  useEffect(() => {
    return () => {
      // Clean up audio context and source node
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          console.log("AudioContext closed");
        });
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        // Initialize AudioContext and AnalyserNode if they don't exist
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.8;

        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
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
  }, [currentSongIndex, isPlaying]);

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
    nextSong(); // Automatically play the next song
  };

  return (
    <div style={{ display: showMusicPlayer ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={`${styles.musicPlayerWrapper} ${
          isMusicPlayerMinimized ? styles.minimizedContainer : ""
        }`}
      >
        <div
          className={`${styles.visualizerWrapper} ${
            isMusicPlayerMinimized ? styles.fadeOut : styles.fadeIn
          }`}
        >
          {!isMusicPlayerMinimized && (
            <div className={styles.visualizerContainer}>
              {analyserRef.current && (
                <AudioVisualizer analyserNode={analyserRef.current} />
              )}
            </div>
          )}
        </div>

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
          <div className={styles.greenCircle} onClick={toggleMinimized}>
            {isMusicPlayerMinimized ? (
              <BsArrowsAngleExpand className={styles.toggleIcon} />
            ) : (
              <BsArrowsAngleContract className={styles.toggleIcon} />
            )}
          </div>
          {/* Minimized State with Marquee */}
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
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
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

              {/* Time */}
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
