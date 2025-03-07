"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Text, OrbitControls, Environment } from "@react-three/drei";
import { Physics, useBox, useSphere, Debug } from "@react-three/cannon";
import styles from "../styles/fallingtext.module.css";
import Model from "./Model";

// Tennis ball with physics
function TennisBall() {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 5, 20], // Closer to camera
    args: [1.2],
    material: { restitution: 0.8 },
    userData: { type: "ball" },
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  useEffect(() => {
    console.log("TennisBall mounted, starting visibility timer");

    // Make ball visible immediately
    setIsVisible(true);
    console.log("Ball visibility set to true");

    // Launch after a delay
    const launchTimer = setTimeout(() => {
      console.log("Launching ball");
      api.velocity.set(0, 0, -25); // Faster velocity toward letters
      api.position.set(0, 5, 20); // Ensure position is set
    }, 2000);

    // Debug position
    const unsubPosition = api.position.subscribe((v) => {
      console.log(
        `Ball position: ${v[0].toFixed(1)}, ${v[1].toFixed(1)}, ${v[2].toFixed(
          1
        )}`
      );
    });

    return () => {
      clearTimeout(launchTimer);
      unsubPosition();
    };
  }, [api]);

  // Debug render
  console.log("TennisBall rendering, visible:", isVisible);

  return (
    <group>
      <mesh ref={ref} castShadow visible={true}>
        {" "}
        {/* Force visible true */}
        <Model scale={[1.2, 1.2, 1.2]} />
        {/* Add a visible sphere for debugging */}
        <sphereGeometry args={[1.2]} />
        <meshStandardMaterial color="yellow" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Ground plane
function Ground() {
  const [ref] = useBox(() => ({
    type: "Static",
    position: [0, -2, 0],
    args: [50, 1, 50],
    material: { restitution: 0.5 },
  }));

  return (
    <mesh ref={ref} receiveShadow position={[0, -2, 0]}>
      <boxGeometry args={[50, 1, 50]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  );
}

// A single fragment of an exploded letter
function LetterFragment({ position, rotation, size, color, velocity }) {
  const [ref] = useBox(() => ({
    mass: 0.1,
    position,
    rotation,
    args: size,
    velocity,
    angularVelocity: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ],
  }));

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Letter with physics and explosion trigger
function Letter({ letter, position }) {
  const [exploded, setExploded] = useState(false);
  const [letterVisible, setLetterVisible] = useState(true);
  const [fragments, setFragments] = useState([]);

  // Use fixed collision boxes instead of text geometry
  const [ref, api] = useBox(() => ({
    mass: 0, // Static until hit
    position,
    args: [2, 2, 2], // MUCH larger collision box
    material: { restitution: 0.3 },
    userData: { type: "letter", letter },
    onCollide: (e) => {
      // Log all collisions to debug
      console.log("Collision detected with", e.body.userData);

      if (e.body.userData?.type === "ball" && !exploded) {
        console.log(`LETTER ${letter} HIT by ball! Creating fragments...`);

        // Create default impact velocity if not available
        const ballVelocity = e.body.velocity || [0, 0, 10];

        // Make the letter dynamic to react to the hit
        api.mass.set(1);

        // Create physical fragments
        createLetterFragments(position, ballVelocity);

        // Hide original letter after a slight delay
        setTimeout(() => {
          setLetterVisible(false);
          setExploded(true);
        }, 50);
      }
    },
  }));

  // Create physical fragments based on impact
  const createLetterFragments = (pos, impactVelocity = [0, 0, 10]) => {
    const fragmentCount = 15;
    const newFragments = [];

    for (let i = 0; i < fragmentCount; i++) {
      // Smaller fragments for better physics
      const size = [
        0.2 + Math.random() * 0.4,
        0.2 + Math.random() * 0.4,
        0.2 + Math.random() * 0.4,
      ];

      // Distribution pattern for fragments
      const fragPos = [
        pos[0] + (Math.random() - 0.5) * 1.5,
        pos[1] + (Math.random() - 0.5) * 1.5,
        pos[2] + (Math.random() - 0.5) * 1.5,
      ];

      const rotation = [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ];

      // Use impact direction but add randomness
      const velocity = [
        (impactVelocity[0] || 0) * 0.3 + (Math.random() - 0.5) * 15,
        (impactVelocity[1] || 0) * 0.3 + Math.random() * 15,
        (impactVelocity[2] || 0) * 0.3 + (Math.random() - 0.5) * 15,
      ];

      newFragments.push({
        id: `${letter}-frag-${i}`,
        position: fragPos,
        rotation,
        size,
        color: letter === "T" ? "#ff4400" : "#ffffff", // Color variety
        velocity,
      });
    }

    setFragments(newFragments);
  };

  return (
    <>
      {letterVisible && (
        <>
          {/* Visual text (doesn't participate in physics) */}
          <Text fontSize={3} position={position}>
            {letter}
          </Text>

          {/* Invisible physics box - for debugging, make it visible */}
          <mesh ref={ref} position={position} visible={false}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="red" transparent opacity={0.2} />
          </mesh>
        </>
      )}

      {/* Fragments */}
      {fragments.map((fragment) => (
        <LetterFragment
          key={fragment.id}
          position={fragment.position}
          rotation={fragment.rotation}
          size={fragment.size}
          color={fragment.color}
          velocity={fragment.velocity}
        />
      ))}
    </>
  );
}

function Scene() {
  const letters = "Kirill";
  const letterPositions = letters.split("").map((letter, i) => {
    return {
      letter,
      position: [(i - 2.5) * 3, 0, 0],
    };
  });

  return (
    <>
      {/* Increased ambient light intensity */}
      <ambientLight intensity={0.8} />

      {/* Increased directional light intensity */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <pointLight position={[0, 10, 0]} intensity={1.5} />
      <Ground />
      <TennisBall />
      {letterPositions.map((item, i) => (
        <Letter key={i} letter={item.letter} position={item.position} />
      ))}
    </>
  );
}

export default function FallingText() {
  return (
    <div
      className={styles.canvasContainer}
      style={{ width: "100%", height: "100vh" }}
    >
      <Canvas
        shadows
        camera={{
          position: [-7.83, 6.79, 17.1],
          rotation: [-0.38, -0.4, -0.15],
          fov: 60,
        }}
      >
        <Physics
          gravity={[0, -20, 0]}
          defaultContactMaterial={{ restitution: 0.7 }}
          iterations={20}
        >
          <Debug scale={1.1} color="red">
            <Scene />
          </Debug>
        </Physics>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
