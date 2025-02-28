"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import * as CANNON from "cannon-es";
import styles from "../styles/fallingtext.module.css";
// Create a physics world
const world = new CANNON.World();
world.gravity.set(0, -20, 0);
world.defaultContactMaterial.restitution = 0.7;

// Move ground plane much lower
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.position.set(0, -50, 0);
world.addBody(groundBody);

const FallingLetter = React.memo(function FallingLetter({
  letter,
  position,
  size,
  color = "white",
  startFalling,
}) {
  const meshRef = useRef();
  const [body, setBody] = useState(null);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);

  useEffect(() => {
    if (startFalling && !isPhysicsEnabled) {
      const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, 0.1));
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(...position),
        shape,
      });

      body.angularVelocity.set(
        Math.random() * 4 - 2,
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
      );

      body.velocity.set(
        Math.random() * 2 - 1,
        Math.random() * -2,
        Math.random() * 2 - 1
      );

      setBody(body);
      world.addBody(body);
      setIsPhysicsEnabled(true);

      return () => {
        world.removeBody(body);
      };
    }
  }, [position, size, startFalling]);

  useFrame(() => {
    if (meshRef.current && body) {
      meshRef.current.position.copy(body.position);
      meshRef.current.quaternion.copy(body.quaternion);

      if (body.position.y < -60) {
        body.position.set(Math.random() * 20 - 10, 40, Math.random() * 20 - 10);
        body.velocity.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
        body.angularVelocity.set(
          Math.random() * 4 - 2,
          Math.random() * 4 - 2,
          Math.random() * 4 - 2
        );
      }
    }
  });

  return (
    <Text
      ref={meshRef}
      position={
        isPhysicsEnabled ? meshRef.current?.position.toArray() : position
      }
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff"
      characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
      castShadow
      receiveShadow
    >
      {letter}
    </Text>
  );
});

const PhysicsUpdate = () => {
  useFrame(() => {
    world.step(1 / 60);
  });
  return null;
};

const Scene = ({ onComplete }) => {
  const isMobile = window.innerWidth < 768;
  const letterSpacing = isMobile ? 6 : 17.5;
  const rowSpacing = isMobile ? 12 : 35;
  const fontSize = isMobile ? 12 : 35;
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [startFalling, setStartFalling] = useState(false);

  // First, memoize the raw text array - split into individual words for mobile
  const rawTextRows = useMemo(
    () =>
      isMobile
        ? ["Creating", "Unique", "Web", "Experiences"]
        : ["Creating Unique", "Web Experiences"],
    [isMobile]
  );

  // Then, memoize the processed text rows with style information
  const textRows = useMemo(
    () =>
      rawTextRows.map((text) =>
        text.split("").map((letter) => ({
          char: letter,
          isItalic:
            letter.toLowerCase() === "u" ||
            letter.toLowerCase() === "n" ||
            letter.toLowerCase() === "i" ||
            letter.toLowerCase() === "q" ||
            letter.toLowerCase() === "u" ||
            letter.toLowerCase() === "e",
        }))
      ),
    [rawTextRows]
  );

  // Memoize letters array using the memoized textRows
  const letters = useMemo(
    () =>
      textRows.flatMap((row, rowIndex) =>
        row.map((letterObj, letterIndex) => ({
          letter: letterObj.char,
          isItalic: letterObj.isItalic,
          row: rowIndex,
          columnIndex: letterIndex,
        }))
      ),
    [textRows]
  );

  useEffect(() => {
    if (visibleLetters < letters.length) {
      const timeout = setTimeout(() => {
        setVisibleLetters((prev) => prev + 1);
      }, 140);
      return () => clearTimeout(timeout);
    } else {
      const fallTimeout = setTimeout(() => {
        setStartFalling(true);
      }, 1000);

      const completeTimeout = setTimeout(() => {
        onComplete?.();
      }, 6000);

      return () => {
        clearTimeout(fallTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [visibleLetters, letters.length, onComplete]);

  const startX = isMobile ? -40 : -125;
  const startY = isMobile ? 50 : 55; // Adjusted for more words on mobile

  return (
    <>
      <PhysicsUpdate />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {letters.map((letterObj, i) => {
        if (i >= visibleLetters) return null;

        let x, y;

        if (isMobile) {
          // Calculate the total width of each word to center it
          const currentWord = textRows[letterObj.row];
          const wordWidth = currentWord.length * letterSpacing;
          const wordCenterOffset = wordWidth / 2;

          // Center each word horizontally and stack vertically
          x = -wordCenterOffset + letterObj.columnIndex * letterSpacing;
          y = startY - letterObj.row * 25;
        } else {
          // Original horizontal arrangement for desktop
          x = startX + letterObj.columnIndex * letterSpacing;
          y = startY - letterObj.row * rowSpacing;
        }

        return (
          <FallingLetter
            key={i}
            letter={letterObj.letter}
            position={[x, y, 0]}
            size={fontSize}
            color="#6cf318"
            startFalling={startFalling}
            italic={letterObj.isItalic}
          />
        );
      })}
    </>
  );
};

const FallingTextScene = ({ onComplete }) => {
  return (
    <div className={styles.canvasContainer}>
      <Canvas
        camera={{ position: [0, 0, 100], fov: 75 }}
        className={styles.canvas}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
        <Scene onComplete={onComplete} />
      </Canvas>
    </div>
  );
};

const FallingText = ({ onComplete }) => {
  return <FallingTextScene onComplete={onComplete} />;
};

export default FallingText;
