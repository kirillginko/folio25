"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
          position: [-20, 7, 45], // Adjusted mobile position to match new perspective
          fov: 85,
        });
      } else {
        setCameraSettings({
          position: [-14, 6, 25.1], // More to the left and lower
          fov: 70,
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
      restitution: 0.3, // Slightly more bounce to prevent sticking
      friction: 0.5, // Reduced friction to prevent fragments getting stuck
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

// Shared geometry and material for performance
const sharedFragmentGeometry = new THREE.BoxGeometry(1, 1, 1);
const sharedFragmentMaterial = new THREE.MeshPhysicalMaterial({
  color: "#32CD32",
  metalness: 0.9,
  roughness: 0.1,
  envMapIntensity: 2,
  side: 2,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  thickness: 2,
});

// Optimized fragment component with shared materials
const LetterFragment = React.memo(function LetterFragment({
  position,
  rotation,
  size,
  velocity,
}) {
  const [canInteractWithLetters, setCanInteractWithLetters] = useState(false);

  // Enable letter collision after delay to prevent getting stuck in impact zone
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanInteractWithLetters(true);
    }, 500); // 500ms delay to clear impact area
    return () => clearTimeout(timer);
  }, []);

  const [ref] = useBox(() => ({
    mass: 0.15,
    position: [position[0], position[1], position[2]],
    rotation,
    args: size,
    velocity,
    angularVelocity: [
      (Math.random() - 0.5) * 1.0,
      (Math.random() - 0.5) * 1.0,
      (Math.random() - 0.5) * 1.0,
    ],
    linearDamping: 0.3,
    angularDamping: 0.4,
    material: {
      friction: 0.3,
      restitution: 0.25,
    },
    sleepSpeedLimit: 0.2,
    sleepTimeLimit: 0.5,
    allowSleep: true,
    // Use different collision groups to avoid letter collision area initially
    collisionFilterGroup: canInteractWithLetters ? 1 : 2,
    collisionFilterMask: canInteractWithLetters ? 1 : 1, // Always collide with ground (group 1)
  }));

  // Use shared geometry and material for better performance
  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      geometry={sharedFragmentGeometry}
      material={sharedFragmentMaterial}
      scale={size}
    />
  );
});

// Individual letter collision box with immediate removal capability
function LetterCollider({ position, index, onCollide, isExploded }) {
  const letterWidth = 3.8;

  const [ref, api] = useBox(() => ({
    mass: 0,
    position: isExploded ? [0, -1000, 0] : position, // Start far away if already exploded
    args: [letterWidth, 4.5, 4.5],
    material: { restitution: 0.3 },
    userData: { type: "letter", index },
    onCollide: (e) => {
      if (!isExploded && e.body.userData?.type === "ball") {
        // Immediately remove collision body on impact
        api.position.set(0, -1000, 0);
        api.mass.set(0);
        onCollide(index, e.body.velocity || [0, 0, -25]);
      }
    },
  }));

  // Remove collision box if letter exploded
  useEffect(() => {
    if (isExploded) {
      api.position.set(0, -1000, 0);
      api.mass.set(0);
    }
  }, [isExploded, api]);

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[letterWidth, 4.5, 4.5]} />
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
    args: [3.8, 3.8, 3.8],
    material: { restitution: 0.3 },
    userData: { type: "letter", letter, index },
    onCollide: (e) => {
      if (!exploded && e.body.userData?.type === "ball") {
        // Immediately disable collision to prevent fragment trapping
        api.position.set(0, -1000, 0);
        api.mass.set(0);

        // Trigger explosion directly from letter collision
        setExploded(true);
        createLetterFragments(position, e.body.velocity || ballVelocity);
        setLetterVisible(false);
      }
    },
  }));

  // Generate fragment data without creating physics objects - optimized count for performance
  const generateFragmentData = (count, letterChar) => {
    const fragmentData = [];
    const optimizedCount = Math.min(count, 10); // Allow up to 10 fragments for better visual impact

    for (let i = 0; i < optimizedCount; i++) {
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
        color: "#32CD32", // Consistent green color for all letters
      });
    }

    return fragmentData;
  };

  // Optimized fragment creation with delayed processing to prevent hitches
  const createLetterFragments = useCallback(
    (pos, impactVelocity = [0, 0, 10]) => {
      if (!fragmentsRef.current) return;

      // Pre-calculate impact data to reduce collision-time computation
      const impactPoint = [...pos];
      const impactDirection = [
        impactVelocity[0] || 0,
        impactVelocity[1] || 0,
        impactVelocity[2] || 0,
      ];

      let normalizedDirection = [0, 0, -1];
      const impactMagnitude = Math.sqrt(
        impactDirection[0] ** 2 +
          impactDirection[1] ** 2 +
          impactDirection[2] ** 2
      );

      if (impactMagnitude > 0.001) {
        normalizedDirection = impactDirection.map((v) => v / impactMagnitude);
      }

      // Process fragments in batches to spread work across frames
      const processFragmentBatch = (startIndex = 0) => {
        const batchSize = 3; // Process 3 fragments per frame (increased for more fragments)
        const endIndex = Math.min(
          startIndex + batchSize,
          fragmentsRef.current.length
        );

        const newFragments = [];

        for (let i = startIndex; i < endIndex; i++) {
          const fragData = fragmentsRef.current[i];
          const maxDistance = 2.0; // Reduced spread for more centralized explosion
          const distance = fragData.distanceWeight * maxDistance;

          // Ensure fragments spawn well outside collision area and above ground
          const minDistance = 4.5; // Increased minimum distance to completely clear impact zone
          const safeDistance = Math.max(distance, minDistance);

          const fragPos = [
            impactPoint[0] +
              safeDistance * Math.sin(fragData.phi) * Math.cos(fragData.theta),
            Math.max(
              impactPoint[1] +
                safeDistance *
                  Math.sin(fragData.phi) *
                  Math.sin(fragData.theta) +
                1.5, // More controlled height spawn
              1.0 // Ensure always above ground level (ground is at -2, so 1.0 is safe)
            ),
            impactPoint[2] + safeDistance * Math.cos(fragData.phi),
          ];

          const sizeScale = 0.8 + 0.4 * (1 - fragData.distanceWeight);
          const size = fragData.size.map((s) => s * sizeScale);

          const velocityScale = 15 * (1 - fragData.distanceWeight * 0.3); // Reduced velocity for centralized explosion
          const upwardBoost = 3; // Minimal upward boost for subtle motion

          const velocity = [
            normalizedDirection[0] * velocityScale * 0.8 +
              (fragPos[0] - impactPoint[0]) * velocityScale * 0.9,
            normalizedDirection[1] * velocityScale * 0.8 +
              (fragPos[1] - impactPoint[1]) * velocityScale * 0.9 +
              upwardBoost,
            normalizedDirection[2] * velocityScale * 0.8 +
              (fragPos[2] - impactPoint[2]) * velocityScale * 0.9,
          ];

          newFragments.push({
            ...fragData,
            position: fragPos,
            size,
            velocity,
          });
        }

        // Update fragments incrementally
        if (startIndex === 0) {
          setFragments(newFragments);
        } else {
          setFragments((prev) => [...prev, ...newFragments]);
        }

        // Continue processing remaining fragments in next frame
        if (endIndex < fragmentsRef.current.length) {
          requestAnimationFrame(() => processFragmentBatch(endIndex));
        }
      };

      // Start batch processing
      processFragmentBatch(0);
    },
    []
  );

  // Pre-generate fragment data on mount to avoid calculation during collision
  useEffect(() => {
    fragmentsRef.current = generateFragmentData(10, letter); // Increased to 8 fragments for better visual impact
  }, [letter]);

  // Handle explosion triggered from parent with optimized timing and minimal re-renders
  useEffect(() => {
    if (shouldExplode && !exploded) {
      // Batch all explosion operations together
      requestAnimationFrame(() => {
        // Collision box already removed in onCollide, just handle visuals
        createLetterFragments(position, ballVelocity);
        setLetterVisible(false);
        setExploded(true);
      });
    }
  }, [shouldExplode, ballVelocity, exploded, createLetterFragments, position]);

  return (
    <>
      {letterVisible && (
        <>
          <Text3D
            font="/fonts/Gill_Sans_Bold.json"
            position={position}
            size={4.5}
            height={3}
            bevelEnabled
            bevelSize={0.45}
            bevelThickness={0.45}
            bevelSegments={12}
            curveSegments={36}
            castShadow
            receiveShadow
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
              <boxGeometry args={[3.8, 3.8, 3.8]} />
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
  const letters = "Kirill.Agency";
  const letterArray = letters.split("");

  // Define custom spacing for each letter based on visual width - increased for better kerning
  const letterSpacing = {
    K: 5.2,
    i: 2.2,
    r: 3.7,
    l: 2.9,
    ".": 3.2,
    A: 5.2,
    g: 3.9,
    e: 3.9,
    n: 3.9,
    c: 3.0,
    y: 3.4,
  };

  // Calculate letter positions with proper kerning
  let currentX = 0;
  const letterPositions = letterArray.map((letter) => {
    const spacing = letterSpacing[letter] || 2.5; // Default spacing
    const position = [currentX, 0.5, 0]; // Position letters above ground (ground is at -2, letters need clearance)
    currentX += spacing;
    return {
      letter,
      position,
    };
  });

  // Center the entire word
  const totalWidth = currentX;
  const centerOffset = -totalWidth / 2;
  letterPositions.forEach((item) => {
    item.position[0] += centerOffset;
  });

  const wordExplodedRef = useRef(false);
  const [wordExploded, setWordExploded] = useState(false);
  const [ballImpactVelocity, setBallImpactVelocity] = useState([0, 0, -25]);
  const [lettersToExplode, setLettersToExplode] = useState([]);

  // Optimized collision handler with debouncing and minimal computation
  const handleLetterCollision = useCallback(
    (letterIndex, velocity) => {
      // Prevent multiple explosions
      if (wordExplodedRef.current) return;

      // Mark as exploded immediately to prevent duplicate calls
      wordExplodedRef.current = true;

      // Simplified impact calculation - only explode hit letter for performance
      const impactIndices = [letterIndex];

      // Pre-calculate velocity magnitude (faster than sqrt for threshold check)
      const velocityMagnitudeSquared =
        velocity[0] * velocity[0] +
        velocity[1] * velocity[1] +
        velocity[2] * velocity[2];

      // Only add adjacent letters for very strong impacts (avoid sqrt calculation)
      if (velocityMagnitudeSquared > 400) {
        // 400 = 20^2
        if (letterIndex > 0) impactIndices.push(letterIndex - 1);
        if (letterIndex < letterArray.length - 1)
          impactIndices.push(letterIndex + 1);
      }

      // Batch state updates to prevent multiple re-renders
      requestAnimationFrame(() => {
        setBallImpactVelocity(velocity);
        setLettersToExplode(impactIndices);
        setWordExploded(true);
      });
    },
    [letterArray.length]
  );

  // Add effect to trigger onComplete after ball launch and collision
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {/* Increased ambient light for more even base illumination */}
      <ambientLight intensity={1.0} />

      {/* Main directional light centered above the text */}
      <directionalLight
        position={[0, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />

      {/* Additional directional light from the front for even illumination */}
      <directionalLight
        position={[-2, 8, 15]}
        intensity={0.6}
        color="#ffffff"
      />

      {/* Point light centered above for consistent reflections */}
      <pointLight
        position={[-1, 12, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
      />

      {/* Subtle fill lights from sides for balanced illumination */}
      <pointLight position={[-12, 8, 8]} intensity={0.7} color="#ffffff" />
      <pointLight position={[12, 8, 8]} intensity={0.4} color="#ffffff" />

      {/* Additional targeted lighting for "Kirill" to brighten it */}
      <pointLight position={[-8, 6, 12]} intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[-10, 10, 8]}
        intensity={0.6}
        color="#ffffff"
      />

      <Ground />
      <TennisBall />

      {/* Individual letter collision boxes - dynamically managed */}
      {letterPositions.map((item, i) => (
        <LetterCollider
          key={`collider-${i}`}
          position={item.position}
          index={i}
          onCollide={handleLetterCollision}
          isExploded={lettersToExplode.includes(i)}
        />
      ))}

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
          iterations={15}
          tolerance={0.001}
          broadphase="SAP"
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
