"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "../styles/BrushCanvas.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";
import { PiPaintBrushFill } from "react-icons/pi";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

const BrushCanvas = () => {
  const colors = [
    "#1a75ff", // blue
    "#ff4d4d", // red
    "#ffb300", // adjusted orange - more yellow-leaning
    "#66ff66", // green
    "#ff66ff", // pink
    "#ffff66", // yellow
    "#000000", // black
  ];

  const [brush, setBrush] = useState({
    weight: 15,
    vibration: 10,
    definition: 2,
    quality: 8,
    opacity: 0.7,
    spacing: 5,
    color: colors[0],
    blend: true,
  });

  // Add p5 instance reference
  const [p5Instance, setP5Instance] = useState(null);

  // Add new refs and state
  const containerRef = useRef(null);
  const draggableInstance = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);

  // Add these state variables at the top with your other states
  const [notificationState, setNotificationState] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Add state to store canvas data
  const [canvasData, setCanvasData] = useState(null);

  const [isNotificationExiting, setIsNotificationExiting] = useState(false);

  // Add canvas ready state
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const { showBrushCanvas, setShowBackdrop, setActiveComponent } =
    useGlobalState();

  // Add isMobile state at the top with other states
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
  );
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const isInitialPositionSet = useRef(false);
  const stablePositionRef = useRef({ x: 0, y: 0 });

  // Add position adjustment effect - EXACTLY like About
  useEffect(() => {
    const adjustPositionAndSize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (isMobile && !isMinimized) {
          // For mobile expanded view
          gsap.set(containerRef.current, {
            x: 0,
            y: 0,
          });
        } else {
          // For desktop or minimized view, maintain position
          const element = containerRef.current.getBoundingClientRect();

          let newX = gsap.getProperty(containerRef.current, "x");
          let newY = gsap.getProperty(containerRef.current, "y");

          // If position is invalid, use saved positions
          if (!newX || !newY || (Math.abs(newX) < 5 && Math.abs(newY) < 5)) {
            if (stablePositionRef.current.x !== 0) {
              newX = stablePositionRef.current.x;
              newY = stablePositionRef.current.y;
            } else if (lastPosition.x !== 0) {
              newX = lastPosition.x;
              newY = lastPosition.y;
            } else {
              // Default fallback position
              if (isMobile) {
                newX = 20;
                newY = 100;
              } else {
                newX = viewportWidth - element.width - 500;
                newY = 200;
              }
            }
          }

          // Ensure position is within bounds
          newX = Math.max(
            20,
            Math.min(newX, viewportWidth - element.width - 20)
          );
          newY = Math.max(
            20,
            Math.min(newY, viewportHeight - element.height - 20)
          );

          // Apply position with no animation to prevent movement
          gsap.set(containerRef.current, {
            x: newX,
            y: newY,
          });

          // Store the position
          stablePositionRef.current = { x: newX, y: newY };
          setLastPosition({ x: newX, y: newY });
        }
      }
    };

    // Run with a delay to ensure component is mounted
    const timer = setTimeout(adjustPositionAndSize, 10);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMinimized, isMobile, showBrushCanvas]);

  const setup = (p5, canvasParentRef) => {
    let canvasWidth = 350;
    let canvasHeight = 300;

    // Adjust canvas size for mobile
    if (isMobile) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      canvasWidth = viewportWidth * 0.9; // 90vw to match container
      canvasHeight = viewportHeight * 0.8 - 80; // 80vh minus controls height
    }

    const canvas = p5
      .createCanvas(canvasWidth, canvasHeight)
      .parent(canvasParentRef);

    canvas.style("width", "100%");
    canvas.style("height", "100%");

    p5.background(255);
    p5.noStroke();
    if (brush.blend) {
      p5.blendMode(p5.MULTIPLY);
    } else {
      p5.blendMode(p5.BLEND);
    }
    setP5Instance(p5);

    if (canvasData) {
      p5.loadImage(canvasData, (img) => {
        p5.image(img, 0, 0);
        // Mark canvas as ready after image loads
        setIsCanvasReady(true);
      });
    } else {
      // Mark canvas as ready immediately if no data to load
      setIsCanvasReady(true);
    }
  };

  // Add clear canvas function
  const clearCanvas = () => {
    if (p5Instance) {
      const currentWidth = p5Instance.width;
      const currentHeight = p5Instance.height;

      p5Instance.blendMode(p5Instance.BLEND); // Reset blend mode
      p5Instance.background(255);

      // Resize canvas to maintain dimensions
      p5Instance.resizeCanvas(currentWidth, currentHeight);

      if (brush.blend) {
        p5Instance.blendMode(p5Instance.MULTIPLY); // Reapply blend mode
      }
      setCanvasData(null); // Clear saved canvas data
    }
  };

  const draw = (p5) => {
    if (p5.mouseIsPressed) {
      const speed =
        p5.abs(p5.mouseX - p5.pmouseX) + p5.abs(p5.mouseY - p5.pmouseY);

      if (speed < 0.1) return;

      // Calculate angle of movement for brush direction
      const angle = p5.atan2(p5.mouseY - p5.pmouseY, p5.mouseX - p5.pmouseX);
      const pressure = calculatePressure(p5, speed);

      for (let i = 0; i < brush.quality; i++) {
        const spreadX = p5.randomGaussian(0, brush.vibration * pressure);
        const spreadY = p5.randomGaussian(0, brush.vibration * pressure);

        const size = brush.weight * pressure;
        const opacity =
          brush.opacity * 0.5 * p5.map(pressure, 0.5, 1.2, 0.3, 0.8);

        const c = p5.color(brush.color + hex2rgba(opacity));
        p5.fill(c);

        const x = p5.mouseX + spreadX;
        const y = p5.mouseY + spreadY;

        // Draw brush head
        p5.push();
        p5.translate(x, y);
        p5.rotate(angle + p5.random(-0.2, 0.2)); // Add slight random rotation

        // Draw main bristle shape
        p5.ellipse(0, 0, size * 2.5, size * 0.8); // Elongated ellipse for brush shape

        // Add bristle details
        const bristles = 3;
        for (let b = 0; b < bristles; b++) {
          const bristleSpread = p5.random(-size / 2, size / 2);
          const bristleLength = p5.random(0.7, 1.3);
          p5.ellipse(bristleSpread, 0, size * 2.5 * bristleLength, size * 0.5);
        }
        p5.pop();

        // Connect strokes for smooth lines
        const points = Math.ceil((speed / brush.spacing) * 0.7);
        for (let j = 0; j < points; j++) {
          const t = j / points;
          const lerpX = p5.lerp(p5.pmouseX + spreadX, x, t);
          const lerpY = p5.lerp(p5.pmouseY + spreadY, y, t);

          p5.push();
          p5.translate(lerpX, lerpY);
          p5.rotate(angle + p5.random(-0.1, 0.1));
          const particleSize = size * p5.random(0.6, 0.9);
          p5.ellipse(
            0,
            0,
            particleSize * 2 * brush.definition,
            particleSize * 0.6 * brush.definition
          );
          p5.pop();
        }
      }
    }
  };

  // Adjust pressure curve for less buildup
  const calculatePressure = (p5, speed) => {
    const a = 0.25; // Increased from 0.15
    const b = 0.3; // Increased from 0.2
    const x = p5.map(speed, 0, 100, 0, 1);
    const pressure = Math.exp(-(Math.pow(x - a, 2) / (2 * Math.pow(b, 2))));
    return p5.map(pressure, 0, 1, 0.3, 0.9); // Reduced from 0.5, 1.2
  };

  const hex2rgba = (opacity) => {
    const alpha = Math.round(opacity * 255).toString(16);
    return alpha.length === 1 ? "0" + alpha : alpha;
  };

  const showNotification = (message, type) => {
    setNotificationState({
      show: true,
      message,
      type,
    });

    // Start exit animation after 2.5 seconds
    setTimeout(() => {
      setIsNotificationExiting(true);

      // Hide notification after animation completes
      setTimeout(() => {
        setNotificationState((prev) => ({
          ...prev,
          show: false,
        }));
        setIsNotificationExiting(false);
      }, 500); // Match animation duration
    }, 2500);
  };

  // Move handleSave before the controls definition
  const handleSave = async () => {
    if (!p5Instance) return;

    setIsLoading(true);
    try {
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement("canvas");
      // Use the actual canvas dimensions
      tempCanvas.width = p5Instance.width;
      tempCanvas.height = p5Instance.height;

      const ctx = tempCanvas.getContext("2d");
      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Get the original canvas element
      const originalCanvas = p5Instance.canvas;

      // Draw the p5 canvas content on top at full size
      ctx.drawImage(
        originalCanvas,
        0,
        0,
        originalCanvas.width,
        originalCanvas.height, // source dimensions
        0,
        0,
        tempCanvas.width,
        tempCanvas.height // destination dimensions
      );

      const canvasData = tempCanvas.toDataURL("image/png", 1.0);

      const requestBody = {
        fromEmail: "drawing@kirill.studio",
        toEmail: "kirillginko@gmail.com",
        message: "New drawing from your website",
        attachment: canvasData,
      };

      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      showNotification("Drawing sent successfully!", "success");
    } catch (err) {
      console.error("Save error:", err);
      showNotification(err.message || "Failed to save drawing", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!p5Instance) return;
    try {
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement("canvas");
      // Use the actual canvas dimensions
      tempCanvas.width = p5Instance.width;
      tempCanvas.height = p5Instance.height;

      const ctx = tempCanvas.getContext("2d");
      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Get the original canvas element
      const originalCanvas = p5Instance.canvas;

      // Draw the p5 canvas content on top at full size
      ctx.drawImage(
        originalCanvas,
        0,
        0,
        originalCanvas.width,
        originalCanvas.height, // source dimensions
        0,
        0,
        tempCanvas.width,
        tempCanvas.height // destination dimensions
      );

      // Create temporary link for download
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = tempCanvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      showNotification("Failed to download drawing", "error");
    }
  };

  const controls = (
    <div className={styles.controls}>
      <label className={styles.control}>
        <div className={styles.labelRow}>
          <span>Size</span>
          <div className={styles.valueDisplay}>({brush.weight})</div>
        </div>
        <input
          type="range"
          min="5"
          max="80"
          value={brush.weight}
          onChange={(e) =>
            setBrush({ ...brush, weight: parseInt(e.target.value) })
          }
        />
      </label>
      <label className={styles.control}>
        <div className={styles.labelRow}>
          <span>Spread</span>
          <div className={styles.valueDisplay}>({brush.vibration})</div>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="0.5"
          value={brush.vibration}
          onChange={(e) =>
            setBrush({ ...brush, vibration: parseFloat(e.target.value) })
          }
        />
      </label>
      <label className={styles.control}>
        <div className={styles.labelRow}>
          <span>Flow</span>
          <div className={styles.valueDisplay}>({brush.definition})</div>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={brush.definition}
          onChange={(e) =>
            setBrush({ ...brush, definition: parseFloat(e.target.value) })
          }
        />
      </label>
      <label className={styles.control}>
        <div className={styles.labelRow}>
          <span>Opacity</span>
          <div className={styles.valueDisplay}>({brush.opacity})</div>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.05"
          value={brush.opacity}
          onChange={(e) =>
            setBrush({ ...brush, opacity: parseFloat(e.target.value) })
          }
        />
      </label>
      <div className={styles.control}>
        <span>Color</span>
        <div className={styles.colorPicker}>
          {colors.map((color, index) => (
            <button
              key={index}
              className={`${styles.colorButton} ${
                brush.color === color ? styles.selected : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setBrush({ ...brush, color })}
            />
          ))}
        </div>
      </div>
      <div className={styles.control}>
        <span>Blend</span>
        <div className={styles.colorPicker}>
          <button
            className={`${styles.colorButton} ${styles.blendButton} ${
              brush.blend ? styles.selected : ""
            }`}
            style={{
              backgroundColor: brush.blend ? "#666" : "transparent",
              border: brush.blend ? "2px solid #666" : "2px solid #666",
            }}
            onClick={() => {
              const newBlendState = !brush.blend;
              setBrush({ ...brush, blend: newBlendState });
              if (p5Instance) {
                p5Instance.blendMode(
                  newBlendState ? p5Instance.MULTIPLY : p5Instance.BLEND
                );
              }
            }}
          />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={clearCanvas} className={styles.clearButton}>
          Clear
        </button>
        <button
          onClick={handleSave}
          className={`${styles.saveButton} ${isLoading ? styles.loading : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Email"}
        </button>
        <button onClick={handleDownload} className={styles.saveButton}>
          Download
        </button>
      </div>
    </div>
  );

  // Modify the useEffect that handles draggable
  useEffect(() => {
    gsap.registerPlugin(Draggable);

    // Add mobile check
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

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

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const createDraggable = () => {
      // Only create draggable if minimized or not on mobile
      if (isMinimized || !isMobile) {
        if (draggableInstance.current) {
          draggableInstance.current.kill();
        }

        draggableInstance.current = Draggable.create(containerRef.current, {
          type: "x,y",
          bounds: window,
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          edgeResistance: isMinimized ? 0.95 : 0.85,
          dragResistance: isMinimized ? 0.2 : 0.15,
          zIndexBoost: true,
          allowEventDefault: true,
          onPress: function (e) {
            if (e.target.closest(`.${styles.canvasWrapper}`)) {
              this.endDrag(e);
            }
          },
          onDragStart: function () {
            gsap.to(this.target, {
              scale: isMinimized ? 1.05 : 1.02,
              duration: 0.2,
            });
          },
          onDragEnd: function () {
            gsap.to(this.target, { scale: 1, duration: 0.2 });

            // Save position after drag
            const newX = gsap.getProperty(this.target, "x");
            const newY = gsap.getProperty(this.target, "y");

            if (newX !== undefined && newY !== undefined) {
              stablePositionRef.current = { x: newX, y: newY };
              setLastPosition({ x: newX, y: newY });
            }
          },
        })[0];
      } else if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };

    createDraggable();

    // Add event listener for forced recreation
    window.addEventListener("recreateDraggables", handleRecreateDraggables);

    // Clean up
    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener(
        "recreateDraggables",
        handleRecreateDraggables
      );
    };
  }, [isMinimized, isMobile, showBrushCanvas]);

  // Modify the toggleMinimized function to hide/show other components
  const toggleMinimized = () => {
    if (!isMinimized) {
      saveCanvasState();

      // Save current position before minimizing on mobile
      if (isMobile && containerRef.current) {
        const currentX = gsap.getProperty(containerRef.current, "x") || 0;
        const currentY = gsap.getProperty(containerRef.current, "y") || 0;
        setLastPosition({ x: currentX, y: currentY });
      }

      // When minimizing, hide the backdrop
      setShowBackdrop(false);
      setActiveComponent(null);
      setIsCanvasReady(false); // Reset canvas ready state
    } else if (isMobile) {
      // When expanding on mobile, show the backdrop
      setShowBackdrop(true);
      setActiveComponent("brushcanvas");
    }

    setIsMinimized((prev) => !prev);
  };

  // Modify the draw function to save canvas data before minimizing
  const saveCanvasState = () => {
    if (p5Instance) {
      const currentCanvas = p5Instance.get();
      setCanvasData(currentCanvas.canvas.toDataURL());
    }
  };

  // Add a resize handler to update canvas when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (p5Instance && isMobile && !isMinimized) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const newWidth = viewportWidth * 0.9;
        const newHeight = viewportHeight * 0.8 - 80; // Account for controls height

        p5Instance.resizeCanvas(newWidth, newHeight);
        if (canvasData) {
          p5Instance.loadImage(canvasData, (img) => {
            p5Instance.image(img, 0, 0);
          });
        } else {
          p5Instance.background(255);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [p5Instance, isMobile, isMinimized, canvasData]);

  // Position and resize handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const padding = 20;

        // Get current transform position
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        // Save current position to stable ref
        if (currentX !== undefined && currentY !== undefined) {
          stablePositionRef.current = { x: currentX, y: currentY };
        }

        // Calculate bounds
        const maxX = windowWidth - rect.width - padding;
        const maxY = windowHeight - rect.height - padding;
        const minX = padding;
        const minY = padding;

        // Check if current position is out of bounds
        if (
          currentX < minX ||
          currentX > maxX ||
          currentY < minY ||
          currentY > maxY
        ) {
          gsap.to(containerRef.current, {
            x: Math.min(Math.max(currentX, minX), maxX),
            y: Math.min(Math.max(currentY, minY), maxY),
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial positioning - only runs once
  useEffect(() => {
    if (isInitialPositionSet.current) return;

    const setInitialPosition = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const element = containerRef.current.getBoundingClientRect();

        // Position based on viewport size
        let newX, newY;
        if (isMobile) {
          // Mobile: position from left with even spacing
          newX = 20;
          newY = 100;
        } else {
          // Desktop: position from right
          newX = viewportWidth - element.width - 500;
          newY = 200;
        }

        // Ensure it stays within bounds
        newX = Math.max(20, Math.min(newX, viewportWidth - element.width - 20));
        newY = Math.max(
          20,
          Math.min(newY, viewportHeight - element.height - 20)
        );

        gsap.set(containerRef.current, {
          x: newX,
          y: newY,
        });

        // Save this initial position
        stablePositionRef.current = { x: newX, y: newY };
        setLastPosition({ x: newX, y: newY });
        isInitialPositionSet.current = true;

        // Add positioned class to show component
        if (containerRef.current) {
          containerRef.current.classList.add(styles.positioned);
        }
      }
    };

    // Initial position with a slight delay to ensure the component is mounted
    setTimeout(setInitialPosition, 100);
  }, [isMobile]);

  // Track component position continuously (like About does)
  useEffect(() => {
    if (!containerRef.current || !isInitialPositionSet.current) return;

    // Update position tracking on an interval
    const trackInterval = setInterval(() => {
      if (containerRef.current) {
        const currentX = gsap.getProperty(containerRef.current, "x");
        const currentY = gsap.getProperty(containerRef.current, "y");

        if (
          currentX !== undefined &&
          currentY !== undefined &&
          (currentX !== 0 || currentY !== 0)
        ) {
          stablePositionRef.current = { x: currentX, y: currentY };
          setLastPosition({ x: currentX, y: currentY });
        }
      }
    }, 500);

    return () => clearInterval(trackInterval);
  }, []);

  return (
    <div style={{ display: showBrushCanvas ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={`${styles.draggableWrapper} ${
          isMobile && !isMinimized ? styles.mobileFixed : ""
        } ${styles.positioned}`}
      >
        {notificationState.show && (
          <div
            className={`${styles.notification} 
                       ${styles[notificationState.type]}
                       ${isNotificationExiting ? styles.exit : ""}`}
          >
            {notificationState.message}
          </div>
        )}
        <div
          className={`${styles.expandButton} brushcanvas-toggle-button`}
          onClick={toggleMinimized}
        >
          {isMinimized ? (
            <BsArrowsAngleExpand className={styles.toggleIcon} />
          ) : (
            <BsArrowsAngleContract className={styles.toggleIcon} />
          )}
        </div>

        {isMinimized && <div className={styles.paintTextLabel}>Paint</div>}

        <div
          className={`${styles.designContainer} ${
            isMinimized ? styles.minimizedContainer : styles.normalContainer
          }`}
        >
          {isMinimized ? (
            <PiPaintBrushFill className={styles.minimizedText} />
          ) : (
            <>
              {controls}
              <div className={styles.canvasWrapper}>
                {!isCanvasReady && (
                  <div className={styles.canvasLoading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading canvas...</p>
                  </div>
                )}
                <Sketch setup={setup} draw={draw} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrushCanvas;
