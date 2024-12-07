"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "../styles/BrushCanvas.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

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
    weight: 9,
    vibration: 6,
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
  const [isAnimating, setIsAnimating] = useState(false);

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(1000, 800).parent(canvasParentRef);
    p5.background(255);
    p5.noStroke();
    if (brush.blend) {
      p5.blendMode(p5.MULTIPLY);
    } else {
      p5.blendMode(p5.BLEND);
    }
    setP5Instance(p5);
  };

  // Add clear canvas function
  const clearCanvas = () => {
    if (p5Instance) {
      p5Instance.blendMode(p5Instance.BLEND); // Reset blend mode
      p5Instance.background(255);
      if (brush.blend) {
        p5Instance.blendMode(p5Instance.MULTIPLY); // Reapply blend mode
      }
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
          max="20"
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
              backgroundColor: brush.blend ? "#000000" : "transparent",
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
      <button onClick={clearCanvas} className={styles.clearButton}>
        Clear
      </button>
    </div>
  );

  // Add resize handler
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
        },
      })[0];
    };

    createDraggable();

    // Add resize handler
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
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isMinimized]);

  useEffect(() => {
    // Animation for expanding/minimizing
    if (containerRef.current) {
      const bounds = document.body.getBoundingClientRect();
      const element = containerRef.current.getBoundingClientRect();
      let newX = gsap.getProperty(containerRef.current, "x");
      let newY = gsap.getProperty(containerRef.current, "y");

      // Check if expanded state would put element out of bounds
      if (!isMinimized) {
        if (element.right + (800 - element.width) > bounds.right - 20) {
          newX = bounds.right - 800 - 20; // 800 is expanded width
        }
        if (element.bottom + (600 - element.height) > bounds.bottom - 20) {
          newY = bounds.bottom - 600 - 20; // 600 is expanded height
        }
      }

      // Animate position if needed
      gsap.to(containerRef.current, {
        x: newX,
        y: newY,
        duration: 0.2,
        ease: "power2.out",
      });

      // Animate size
      if (!isMinimized) {
        gsap.fromTo(
          containerRef.current.children[1],
          {
            height: "50px",
            width: "100px",
            borderRadius: "25px",
          },
          {
            height: "600px",
            width: "800px",
            borderRadius: "16px",
            duration: 0.2,
            ease: "power2.out",
          }
        );
      } else {
        gsap.to(containerRef.current.children[1], {
          height: "50px",
          width: "100px",
          borderRadius: "25px",
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [isMinimized]);

  const toggleMinimized = () => {
    setIsAnimating(true);
    setIsMinimized((prev) => !prev);
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div ref={containerRef} className={styles.draggableWrapper}>
      <div className={styles.greenCircle} onClick={toggleMinimized}></div>
      <div
        className={`${styles.designContainer} ${
          isMinimized ? styles.minimizedContainer : styles.normalContainer
        }`}
      >
        <div
          style={{
            opacity: isMinimized ? 0 : 1,
            position: isMinimized ? "absolute" : "relative",
            pointerEvents: isMinimized ? "none" : "auto",
          }}
        >
          {controls}
          <div className={styles.canvasWrapper}>
            <Sketch setup={setup} draw={draw} />
          </div>
        </div>
        {isMinimized && (
          <div className={styles.minimizedContent}>
            <span className={styles.minimizedText}>Draw</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrushCanvas;
