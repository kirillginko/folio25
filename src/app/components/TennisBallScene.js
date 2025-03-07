// pages/index.js
"use client"; // Ensure this is a client component

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Physics, useSphere, usePlane } from "@react-three/cannon";
import Model from "./Model";

function PhysicsTennisBall(props) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 10, 0], // Start higher up
    args: [0.65], // Tennis ball radius
    material: { restitution: 0.7 }, // Bounciness
    userData: { type: "tennisBall" },
    ...props,
  }));

  // Initial impulse to make the ball move
  useEffect(() => {
    api.velocity.set(0, -5, 0); // Initial downward velocity
    api.angularVelocity.set(1, 0.5, 0); // Initial spin
  }, [api]);

  return (
    <mesh ref={ref}>
      <Model scale={[0.65, 0.65, 0.65]} />
    </mesh>
  );
}

// Ground plane
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0],
    material: { restitution: 0.5 },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#202020" />
    </mesh>
  );
}

export default function TennisBallScene() {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Physics gravity={[0, -9.81, 0]}>
          <PhysicsTennisBall />
          <Ground />
        </Physics>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
