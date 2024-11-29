// pages/index.js
"use client"; // Ensure this is a client component

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Model from "./Model";

// Create a wrapper component for the spinning model
function SpinningModel() {
  const modelRef = useRef();

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.09; // Spin around Y axis
      // modelRef.current.rotation.x += 0.02; // Add tilt around X axis
      // modelRef.current.rotation.z += 0.01; // Add slight roll around Z axis
    }
  });

  return <Model ref={modelRef} position={[-2, 2.4, 0]} scale={1} />;
}

export default function TennisBallScene() {
  return (
    <div
      style={{
        width: "300px",
        height: "300px",
        position: "absolute",
        top: "10px",
        left: "10px",
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        <SpinningModel />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
