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
    position: [-12, 6, 17.1], // More to the left and lower
    fov: 65,
  });

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setCameraSettings({
          position: [-10, 7, 32], // Adjusted mobile position to match new perspective
          fov: 75,
        });
      } else {
        setCameraSettings({
          position: [-12, 6, 17.1], // More to the left and lower
          fov: 65,
        });
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cameraSettings;
}

// Tennis ball with physics - powerful direct trajectory to hit letters
function TennisBall() {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 8, 50], // Start even further back
    args: [1.5],
    material: { restitution: 0.8 },
    userData: { type: "ball" },
    linearDamping: 0.05, // Reduced damping for less slowdown
    angularDamping: 0.1,
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
  }));

  useEffect(() => {
    const launchTimer = setTimeout(() => {
      if (ref.current) {
        ref.current.userData = { type: "ball" };
      }

      // Position with slight randomness
      const randomX = (Math.random() - 0.5) * 3; // Further reduced randomness
      const launchY = 8; // Same moderate height

      // Position ball even further back for more momentum
      api.position.set(randomX, launchY, 50);

      setTimeout(() => {
        // Much stronger horizontal velocity for guaranteed hit
        api.velocity.set(
          randomX * -0.5, // Same correction toward center
          -4, // Less downward velocity
          -70 // Dramatically increased forward velocity
        );

        // Add angular velocity for spin effect
        api.angularVelocity.set(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          Math.random() * 10 - 5
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
    material: {
      restitution: 0.2, // Reduced bounciness
      friction: 0.8, // Increased friction
    },
  }));

  // Load grass textures
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
    mass: 0.2, // Increased mass for better physical response
    position: [
      position[0],
      position[1] + 0.5, // Raise position slightly to avoid ground intersection
      position[2],
    ],
    rotation,
    args: size,
    velocity,
    angularVelocity: [
      (Math.random() - 0.5) * 3, // Reduced angular velocity
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
    ],
    linearDamping: 0.3, // Increased damping to reduce bouncing
    angularDamping: 0.3, // Increased angular damping
    material: {
      friction: 0.3, // Add friction to prevent sliding
      restitution: 0.2, // Lower restitution to reduce bounciness
    },
    sleepSpeedLimit: 0.3, // Allow physics objects to sleep when nearly stationary
    sleepTimeLimit: 0.8, // Time before sleep is applied (in seconds)
    allowSleep: true, // Enable sleep for better performance
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={2}
        side={2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        thickness={2}
      />
    </mesh>
  );
});

// Individual letter collision box
function LetterCollider({ position, index, onCollide }) {
  const letterWidth = 2.5; // Slightly narrower than visual size for precision

  const [ref] = useBox(() => ({
    mass: 0,
    position,
    args: [letterWidth, 3, 3], // Letter collision size
    material: { restitution: 0.3 },
    userData: { type: "letter", index },
    onCollide: (e) => {
      if (e.body.userData?.type === "ball") {
        onCollide(index, e.body.velocity || [0, 0, -25]);
      }
    },
  }));

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[letterWidth, 3, 3]} />
      <meshStandardMaterial color="red" transparent opacity={0.1} />
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
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: [2.5, 2.5, 2.5],
    material: { restitution: 0.3 },
    userData: { type: "letter", letter, index },
    onCollide: (e) => {
      if (!exploded && e.body.userData?.type === "ball") {
        // Trigger explosion directly from letter collision
        setExploded(true);
        createLetterFragments(position, e.body.velocity || ballVelocity);
        setLetterVisible(false);
        // Remove the physics body completely
        api.position.set(0, -1000, 0); // Move far away
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
      const maxDistance = 3.0; // Increased from 1.5 for wider spread
      const distance = fragData.distanceWeight * maxDistance;

      // Calculate position relative to impact point using pre-calculated angles
      // Add more upward bias for dramatic effect
      const fragPos = [
        impactPoint[0] +
          distance * Math.sin(fragData.phi) * Math.cos(fragData.theta),
        impactPoint[1] +
          distance * Math.sin(fragData.phi) * Math.sin(fragData.theta) +
          0.8, // Increased upward bias from 0.3 to 0.8
        impactPoint[2] + distance * Math.cos(fragData.phi),
      ];

      // Size inversely proportional to distance (smaller fragments near impact)
      const sizeScale = 0.8 + 0.4 * (1 - fragData.distanceWeight);
      const size = fragData.size.map((s) => s * sizeScale);

      // Dramatically increased velocity and upward force
      const velocityScale = 25 * (1 - fragData.distanceWeight * 0.5); // Increased from 10 and adjusted scaling
      const upwardBoost = 8; // Significant upward force

      const velocity = [
        normalizedDirection[0] * velocityScale * 0.8 +
          (fragPos[0] - impactPoint[0]) * velocityScale * 0.9,
        normalizedDirection[1] * velocityScale * 0.8 +
          (fragPos[1] - impactPoint[1]) * velocityScale * 0.9 +
          upwardBoost, // Add strong upward velocity
        normalizedDirection[2] * velocityScale * 0.8 +
          (fragPos[2] - impactPoint[2]) * velocityScale * 0.9,
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

  // Pre-generate fragment data on mount to avoid calculation during collision
  useEffect(() => {
    fragmentsRef.current = generateFragmentData(7, letter);
  }, [letter]);

  // Handle explosion triggered from parent with optimized timing
  useEffect(() => {
    if (shouldExplode && !exploded) {
      createLetterFragments(position, ballVelocity);
      setLetterVisible(false);
      setExploded(true);
      // Remove the physics body completely
      api.position.set(0, -1000, 0); // Move far away
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

          {/* Only render collision box if not exploded */}
          {!exploded && (
            <mesh ref={ref} position={position} visible={false}>
              <boxGeometry args={[2.5, 2.5, 2.5]} />
              <meshStandardMaterial color="red" transparent opacity={0.2} />
            </mesh>
          )}
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

// Update Scene component's collision handling
function Scene({ onComplete }) {
  const letters = "Kirill.Kirill";
  const letterArray = letters.split("");

  // Calculate letter positions with explicit center alignment
  const totalWidth = letterArray.length * 3;
  const startX = -totalWidth / 2 + 1.5; // Center the word and offset by half letter width

  const letterPositions = letterArray.map((letter, i) => {
    return {
      letter,
      position: [startX + i * 3, 0, 0],
    };
  });

  const wordExplodedRef = useRef(false);
  const [wordExploded, setWordExploded] = useState(false);
  const [ballImpactVelocity, setBallImpactVelocity] = useState([0, 0, -25]);
  const [lettersToExplode, setLettersToExplode] = useState([]);

  // Handle letter collision - direct and precise
  const handleLetterCollision = (letterIndex, velocity) => {
    // Prevent multiple explosions
    if (wordExplodedRef.current) return;

    console.log(
      `Letter collision: ${letterIndex} (${letterArray[letterIndex]})`
    );

    // Mark as exploded
    wordExplodedRef.current = true;

    // Create array of letters to explode (hit letter and maybe adjacent)
    const impactIndices = [letterIndex];

    // Maybe add adjacent letters based on velocity magnitude
    const velocityMagnitude = Math.sqrt(
      velocity[0] * velocity[0] +
        velocity[1] * velocity[1] +
        velocity[2] * velocity[2]
    );

    // For strong impacts, maybe break adjacent letters
    if (velocityMagnitude > 20) {
      if (letterIndex > 0) impactIndices.push(letterIndex - 1);
      if (letterIndex < letterArray.length - 1)
        impactIndices.push(letterIndex + 1);
    }

    console.log("Breaking letters:", impactIndices);

    // Update state
    setBallImpactVelocity(velocity);
    setLettersToExplode(impactIndices);
    setWordExploded(true);
  };

  // Add effect to trigger onComplete after ball launch and collision
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />

      <pointLight
        position={[0, 10, 0]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
      />

      <Ground />
      <TennisBall />

      {/* Individual letter collision boxes - only render if not exploded */}
      {letterPositions.map(
        (item, i) =>
          !lettersToExplode.includes(i) && (
            <LetterCollider
              key={`collider-${i}`}
              position={item.position}
              index={i}
              onCollide={handleLetterCollision}
            />
          )
      )}

      {/* Render letters */}
      {letterPositions.map((item, i) => (
        <Letter
          key={i}
          letter={item.letter}
          position={item.position}
          index={i}
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
        shadows="soft"
        camera={{
          position: cameraSettings.position,
          rotation: [-0.35, -0.5, -0.2], // Adjusted rotation for new camera position
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
