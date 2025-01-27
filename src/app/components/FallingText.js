"use client";
import React, { useRef, useEffect, useState } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { Text, OrbitControls, Grid } from "@react-three/drei";
import * as CANNON from "cannon-es";
import localFont from "next/font/local";

const austin = localFont({
  src: "../fonts/AustinCy-Roman.woff2",
  variable: "--font-austin",
});

// Create a physics world
const world = new CANNON.World();
world.gravity.set(0, -20, 0);
world.defaultContactMaterial.restitution = 0.7;

// Move ground plane much lower
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.position.set(0, -50, 0); // Moved ground much lower
world.addBody(groundBody);

const FallingLetter = ({
  letter,
  position,
  size,
  color = "white",
  startFalling,
}) => {
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

      // Add more initial randomness to the falling motion
      body.angularVelocity.set(
        Math.random() * 4 - 2, // Increased rotation range
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
      );

      // Add some initial velocity
      body.velocity.set(
        Math.random() * 2 - 1,
        Math.random() * -2, // Initial downward velocity
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

      // Reset position if falls too far
      if (body.position.y < -60) {
        body.position.set(
          Math.random() * 20 - 10, // Wider range for x position
          40, // Higher reset position
          Math.random() * 20 - 10 // Wider range for z position
        );
        body.velocity.set(
          Math.random() * 4 - 2, // More horizontal velocity
          0,
          Math.random() * 4 - 2
        );
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
      font={austin.src}
      characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
    >
      {letter}
    </Text>
  );
};

const PhysicsUpdate = () => {
  useFrame(() => {
    world.step(1 / 60);
  });
  return null;
};

const Scene = () => {
  const textRows = ["Kirill Ginko", "Creative Developer"];
  const letterSpacing = 6;
  const rowSpacing = 12;
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [startFalling, setStartFalling] = useState(false);

  // Flatten the rows into a single array of letters with their row information
  const letters = textRows.flatMap((row, rowIndex) =>
    row.split("").map((letter) => ({
      letter,
      row: rowIndex,
    }))
  );

  useEffect(() => {
    if (visibleLetters < letters.length) {
      const timeout = setTimeout(() => {
        setVisibleLetters((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const fallTimeout = setTimeout(() => {
        setStartFalling(true);
      }, 1000);
      return () => clearTimeout(fallTimeout);
    }
  }, [visibleLetters, letters.length]);

  return (
    <>
      <PhysicsUpdate />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        position={[0, -50, 0]} // Moved grid to match ground plane
      />

      {letters.map((letterObj, i) => {
        if (i >= visibleLetters) return null;

        // Calculate position based on the letter's row
        const rowLength = textRows[letterObj.row].length;
        const x = (i - letters.length / 2) * letterSpacing;
        const y = 30 - letterObj.row * rowSpacing; // Higher starting position
        const z = 0;

        return (
          <FallingLetter
            key={i}
            letter={letterObj.letter}
            position={[x, y, z]}
            size={8}
            color="#ffffff"
            startFalling={startFalling}
          />
        );
      })}
    </>
  );
};

const FallingTextScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 80], fov: 70 }} // Increased FOV for better view
      style={{ width: "100%", height: "100vh" }}
    >
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
      />
      <Scene />
    </Canvas>
  );
};

export default FallingTextScene;
