"use client";
import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Text3D,
  OrbitControls,
  Environment,
  useTexture,
} from "@react-three/drei";
import { Physics, useBox, useSphere } from "@react-three/cannon";
import styles from "../styles/fallingtext.module.css";
import Model from "./Model";
import * as THREE from "three";

// Add responsive camera hook
function useResponsiveCamera() {
  const [cameraSettings, setCameraSettings] = useState({
    position: [-7.83, 6.79, 17.1],
    fov: 55,
  });

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setCameraSettings({
          position: [-5, 8, 32], // Moved camera back slightly to show full word
          fov: 70, // Slightly wider FOV to ensure full word visibility
        });
      } else {
        setCameraSettings({
          position: [-7.83, 6.79, 17.1], // Original desktop position
          fov: 55, // Original desktop FOV
        });
      }
    }

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cameraSettings;
}

// Tennis ball with physics
function TennisBall() {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 5, 35], // Moved even further back to stay out of view
    args: [1.5],
    material: { restitution: 0.8 },
    userData: { type: "ball" },
    linearDamping: 0.1,
    angularDamping: 0.1,
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
  }));

  useEffect(() => {
    const launchTimer = setTimeout(() => {
      if (ref.current) {
        ref.current.userData = { type: "ball" };
      }

      const randomX = (Math.random() - 0.5) * 8;

      api.position.set(randomX, 5, 35); // Updated starting position

      setTimeout(() => {
        api.velocity.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          -50 // Increased velocity for faster impact from further back
        );
      }, 50);
    }, 2000);

    return () => {
      clearTimeout(launchTimer);
    };
  }, [api, ref]);

  return (
    <group>
      <mesh ref={ref} castShadow visible={true}>
        <Model scale={[1.2, 1.2, 1.2]} />
        <sphereGeometry args={[1.5]} />
        <meshStandardMaterial color="yellow" transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Updated Ground function with grass texture needs update
function Ground() {
  const [ref] = useBox(() => ({
    type: "Static",
    position: [0, -2, 0],
    args: [100, 1, 100],
    material: { restitution: 0.5 },
  }));

  // Load grass textures needs update
  const grassTextures = useTexture({
    map: "/textures/grass/grass_diffuse.jpg",
    normalMap: "/textures/grass/grass_normal.jpg",
    roughnessMap: "/textures/grass/grass_roughness.jpg",
    aoMap: "/textures/grass/grass_ao.jpg",
  });

  // Apply texture repetition for realistic scale
  Object.values(grassTextures).forEach((texture) => {
    texture.repeat.set(20, 20);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });

  return (
    <mesh ref={ref} receiveShadow position={[0, -2, 0]}>
      <boxGeometry args={[100, 1, 100]} />
      <meshStandardMaterial
        {...grassTextures}
        color="#ffffff"
        transparent={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// A single fragment of an exploded letter
const LetterFragment = React.memo(function LetterFragment({
  position,
  rotation,
  size,
  color,
  velocity,
}) {
  const [ref] = useBox(() => ({
    mass: 0.1,
    position,
    rotation,
    args: size,
    velocity,
    angularVelocity: [
      (Math.random() - 0.5) * 5, // Reduced angular velocity
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
    ],
    linearDamping: 0.2, // Add damping to improve physics stability
    angularDamping: 0.2, // Add angular damping
  }));

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

// Add a new component to handle the entire word collision
function WordCollider({ letters, onCollide }) {
  // Create a single collision box for the entire word
  const [ref] = useBox(() => ({
    mass: 0,
    // Position at the center of all letters
    position: [0, 0, 0],
    // Make the box wider and deeper for better collision detection
    args: [letters.length * 3.5, 4, 5], // Increased size in all dimensions
    material: { restitution: 0.3 },
    userData: { type: "word" },
    onCollide: (e) => {
      // Check for collision with ball
      if (e.body.userData?.type === "ball") {
        // Get ball position at impact
        const ballPosition = e.body.position;
        // Calculate which letters should explode based on proximity
        onCollide(e.body.velocity || [0, 0, -25], ballPosition);
      }
    },
  }));

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[letters.length * 3.5, 4, 5]} />
      <meshStandardMaterial color="blue" transparent opacity={0.1} />
    </mesh>
  );
}

// Letter with simplified explosion logic and direct collision detection
const Letter = React.memo(function Letter({
  letter,
  position,
  index,
  shouldExplode,
  ballVelocity,
}) {
  const [exploded, setExploded] = useState(false);
  const [letterVisible, setLetterVisible] = useState(true);
  const [fragments, setFragments] = useState([]);
  const fragmentsRef = useRef(null);

  // Pre-generate fragment data on mount to avoid calculation during collision
  useEffect(() => {
    // Pre-calculate potential fragments - REDUCED COUNT to 7
    fragmentsRef.current = generateFragmentData(7, letter);
  }, [letter]);

  // Regular physics for the letter with direct collision detection added
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: [2.5, 2.5, 2.5], // Increased size for better collision detection
    material: { restitution: 0.3 },
    userData: { type: "letter", letter, index },
    // Add direct letter-level collision detection as a backup
    onCollide: (e) => {
      if (!exploded && e.body.userData?.type === "ball") {
        // Trigger explosion directly from letter collision
        setExploded(true);
        createLetterFragments(position, e.body.velocity || ballVelocity);
        setLetterVisible(false);
        api.mass.set(0);
      }
    },
  }));

  // Generate fragment data without creating physics objects
  const generateFragmentData = (count, letterChar) => {
    const fragmentData = [];

    for (let i = 0; i < count; i++) {
      // LARGER SIZE for better visual impact with fewer fragments
      const size = [
        0.6 + Math.random() * 0.8, // Increased base size
        0.6 + Math.random() * 0.8,
        0.6 + Math.random() * 0.8,
      ];

      // Random rotation pre-calculated
      const rotation = [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ];

      fragmentData.push({
        id: `${letterChar}-frag-${i}`,
        size,
        rotation,
        distanceWeight: Math.pow(Math.random(), 1.5), // Adjusted power for more center bias
        theta: Math.random() * Math.PI * 2, // Horizontal angle
        phi: Math.random() * Math.PI, // Vertical angle
        color: letterChar === "T" ? "#ff4400" : "#32CD32",
      });
    }

    return fragmentData;
  };

  // Create physical fragments based on impact
  const createLetterFragments = (pos, impactVelocity = [0, 0, 10]) => {
    if (!fragmentsRef.current) return;

    // Calculate impact point - exact center for better consistency
    const impactPoint = [...pos];

    // Ball direction normalized
    const impactDirection = [
      impactVelocity[0] || 0,
      impactVelocity[1] || 0,
      impactVelocity[2] || 0,
    ];

    // Normalize only if magnitude is non-zero
    let normalizedDirection = [0, 0, -1]; // Default direction
    const impactMagnitude = Math.sqrt(
      impactDirection[0] ** 2 +
        impactDirection[1] ** 2 +
        impactDirection[2] ** 2
    );

    if (impactMagnitude > 0.001) {
      normalizedDirection = impactDirection.map((v) => v / impactMagnitude);
    }

    const newFragments = fragmentsRef.current.map((fragData) => {
      const maxDistance = 2.0; // Slightly reduced max distance for larger pieces
      const distance = fragData.distanceWeight * maxDistance;

      // Calculate position relative to impact point using pre-calculated angles
      const fragPos = [
        impactPoint[0] +
          distance * Math.sin(fragData.phi) * Math.cos(fragData.theta),
        impactPoint[1] +
          distance * Math.sin(fragData.phi) * Math.sin(fragData.theta),
        impactPoint[2] + distance * Math.cos(fragData.phi),
      ];

      // Size inversely proportional to distance (smaller fragments near impact)
      const sizeScale = 0.8 + 0.4 * (1 - fragData.distanceWeight); // Increased base scale
      const size = fragData.size.map((s) => s * sizeScale);

      // Slightly reduced velocity for better physics stability
      const velocityScale = 15 * (1 - fragData.distanceWeight); // Reduced from 20
      const velocity = [
        normalizedDirection[0] * velocityScale * 0.6 +
          (fragPos[0] - impactPoint[0]) * velocityScale * 0.7,
        normalizedDirection[1] * velocityScale * 0.6 +
          (fragPos[1] - impactPoint[1]) * velocityScale * 0.7,
        normalizedDirection[2] * velocityScale * 0.6 +
          (fragPos[2] - impactPoint[2]) * velocityScale * 0.7,
      ];

      return {
        ...fragData,
        position: fragPos,
        size,
        velocity,
      };
    });

    setFragments(newFragments);
  };

  // Handle explosion triggered from parent with optimized timing
  useEffect(() => {
    if (shouldExplode && !exploded) {
      // Create fragments immediately, no waiting for RAF
      createLetterFragments(position, ballVelocity);
      // Hide letter immediately to avoid visual stutter
      setLetterVisible(false);
      setExploded(true);
      // Set mass to 0 to prevent additional physics calculations
      api.mass.set(0);
    }
  }, [shouldExplode, ballVelocity, exploded, index, letter, position, api]);

  return (
    <>
      {letterVisible && (
        <>
          <Text3D
            font="/fonts/Grotesk_Bold.json"
            position={position}
            size={3}
            height={2}
            bevelEnabled
            bevelSize={0.3}
            bevelThickness={0.3}
            bevelSegments={10}
            curveSegments={32}
          >
            {letter}
            <meshPhysicalMaterial
              color="#32CD32"
              metalness={0.9}
              roughness={0.1}
              envMapIntensity={2}
              side={2}
              clearcoat={1}
              clearcoatRoughness={0.1}
              thickness={2}
            />
          </Text3D>

          <mesh ref={ref} position={position} visible={false}>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshStandardMaterial color="red" transparent opacity={0.2} />
          </mesh>
        </>
      )}

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
});

function Scene({ onComplete }) {
  const letters = "Kirill.Kirill";
  const letterArray = letters.split("");

  const letterPositions = letterArray.map((letter, i) => {
    return {
      letter,
      position: [(i - 3.9) * 3, 0, 0],
    };
  });

  // State to trigger word explosion - use useRef to avoid re-renders
  const wordExplodedRef = useRef(false);
  const [wordExploded, setWordExploded] = useState(false);
  const [ballImpactVelocity, setBallImpactVelocity] = useState([0, 0, -25]);
  // Track which letters should explode (by index)
  const [lettersToExplode, setLettersToExplode] = useState([]);

  // Calculate impact radius - controls how many letters will break
  // Increase this to make more letters break at once
  const impactRadius = 12; // Increased from 6 to ensure more letters break

  // Handle word collision
  const handleWordCollision = (velocity, ballPosition) => {
    // Skip state update if already exploded using ref for faster check
    if (wordExplodedRef.current) return;

    console.log("Word collision handler triggered!");

    // Mark as exploded immediately with ref
    wordExplodedRef.current = true;

    // Calculate which letters should explode based on proximity to ball impact
    const letterImpactIndices = [];

    // If we have ball position, use it to determine which letters to explode
    if (ballPosition) {
      console.log("Using ball position to determine impact:", ballPosition);

      letterPositions.forEach((item, index) => {
        // Calculate distance from this letter to the ball impact point
        const dx = item.position[0] - ballPosition[0];
        const dy = item.position[1] - ballPosition[1];
        const dz = item.position[2] - ballPosition[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        console.log(
          `Letter ${index} (${item.letter}) distance: ${distance.toFixed(2)}`
        );

        // If this letter is within the impact radius, mark it for explosion
        if (distance < impactRadius) {
          letterImpactIndices.push(index);
          console.log(`Letter ${index} (${item.letter}) will explode`);
        }
      });
    } else {
      // Fallback: If no ball position, explode all letters
      console.log("No ball position, using fallback");
      for (let i = 0; i < letterPositions.length; i++) {
        letterImpactIndices.push(i);
      }
    }

    // Ensure we have at least some letters to explode
    if (letterImpactIndices.length === 0) {
      console.log("No letters selected for explosion, using fallback");
      // If no letters were selected, explode the central 4 letters
      const middleIndex = Math.floor(letterPositions.length / 2);
      for (let i = middleIndex - 2; i <= middleIndex + 2; i++) {
        if (i >= 0 && i < letterPositions.length) {
          letterImpactIndices.push(i);
        }
      }
    }

    console.log("Final explosion indices:", letterImpactIndices);

    // Batch state updates in a single render cycle
    setBallImpactVelocity(velocity);
    setLettersToExplode(letterImpactIndices);
    setWordExploded(true);
  };

  // Add effect to trigger onComplete after ball launch and collision
  useEffect(() => {
    // Wait for:
    // - Initial delay (2000ms)
    // - Ball travel time (~1000ms)
    // - Collision and fragment animation (2000ms)
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000); // Increased to 5 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <pointLight position={[0, 10, 0]} intensity={1.5} />
      <Ground />
      <TennisBall />

      {/* Single collision box for the word */}
      <WordCollider letters={letters} onCollide={handleWordCollision} />

      {/* Render all letters */}
      {letterPositions.map((item, i) => (
        <Letter
          key={i}
          letter={item.letter}
          position={item.position}
          index={i}
          // Only explode this letter if it's in the impact zone
          shouldExplode={wordExploded && lettersToExplode.includes(i)}
          ballVelocity={ballImpactVelocity}
        />
      ))}
    </>
  );
}

export default function FallingText({ onComplete }) {
  const cameraSettings = useResponsiveCamera();

  return (
    <div className={styles.canvasContainer}>
      <Canvas
        shadows
        camera={{
          position: cameraSettings.position,
          rotation: [-0.38, -0.4, -0.15],
          fov: cameraSettings.fov,
        }}
      >
        <Physics
          gravity={[0, -20, 0]}
          defaultContactMaterial={{ restitution: 0.7 }}
          iterations={20}
        >
          <Scene onComplete={onComplete} />
        </Physics>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.3}
          target={[0, 0, 0]}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
