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

// Add responsive camera hook with performance detection
function useResponsiveCamera() {
  const [cameraSettings, setCameraSettings] = useState({
    position: [-12, 6, 17.1],
    fov: 65,
    isMobile: false,
    isLowPerformance: false,
  });

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      // Detect low performance devices
      const isLowPerformance =
        isMobile ||
        navigator.hardwareConcurrency <= 4 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        setCameraSettings({
          position: [-20, 7, 45],
          fov: 85,
          isMobile: true,
          isLowPerformance,
        });
      } else {
        setCameraSettings({
          position: [-14, 6, 25.1],
          fov: 70,
          isMobile: false,
          isLowPerformance,
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
function TennisBall({ isLowPerformance }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 8, 50],
    args: [1.5],
    material: { restitution: 0.8 },
    userData: { type: "ball" },
    linearDamping: 0.05,
    angularDamping: 0.1,
    collisionFilterGroup: 1,
    collisionFilterMask: 1 | 2,
  }));

  useEffect(() => {
    // Reduced delay for faster action on low-performance devices
    const launchDelay = isLowPerformance ? 1000 : 1500;

    const launchTimer = setTimeout(() => {
      if (ref.current) {
        ref.current.userData = { type: "ball" };
      }

      const randomX = (Math.random() - 0.5) * 3;
      const launchY = 8;

      api.position.set(randomX, launchY, 50);

      setTimeout(() => {
        api.velocity.set(
          randomX * -0.5,
          -6,
          -95
        );

        // Reduce angular velocity on low-performance devices
        const angularSpeed = isLowPerformance ? 5 : 10;
        api.angularVelocity.set(
          Math.random() * angularSpeed - angularSpeed/2,
          Math.random() * angularSpeed - angularSpeed/2,
          Math.random() * angularSpeed - angularSpeed/2
        );
      }, 50);
    }, launchDelay);

    return () => {
      clearTimeout(launchTimer);
    };
  }, [api, ref, isLowPerformance]);

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
    collisionFilterGroup: 1, // Ground in group 1
    collisionFilterMask: 1 | 4, // Collide with balls (group 1) and fragments (group 4)
    material: {
      restitution: 0.4, // More bounce to prevent sticking
      friction: 0.3, // Further reduced friction to prevent fragments getting stuck
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
    }, 1000); // Increased to 1000ms delay to completely clear impact area
    return () => clearTimeout(timer);
  }, []);

  const [ref, api] = useBox(() => ({
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
    collisionFilterGroup: canInteractWithLetters ? 1 : 4,
    collisionFilterMask: canInteractWithLetters ? 1 : 1, // Always collide with ground (group 1), avoid letters (group 2)
  }));

  // Add force field effect to push fragments away from collision area for first few seconds
  useEffect(() => {
    if (!ref.current || !api) return;
    
    const forceInterval = setInterval(() => {
      if (ref.current) {
        const fragPos = ref.current.position;
        const collisionCenterY = 0.5; // Letter collision area Y position
        const collisionAreaRadius = 3; // Area around letters to avoid
        
        // Calculate distance from collision area center
        const distanceFromCenter = Math.sqrt(
          fragPos.x * fragPos.x + 
          (fragPos.y - collisionCenterY) * (fragPos.y - collisionCenterY) + 
          fragPos.z * fragPos.z
        );
        
        // Apply very gentle force only if fragment gets stuck in collision area
        if (distanceFromCenter < collisionAreaRadius && fragPos.y > -1 && fragPos.y < 2) {
          const forceStrength = 2 * (1 - distanceFromCenter / collisionAreaRadius); // Gentle anti-stick force
          const forceDirection = [
            fragPos.x / distanceFromCenter || 0,
            Math.max((fragPos.y - collisionCenterY) / distanceFromCenter, 0.1),
            fragPos.z / distanceFromCenter || 0
          ];
          
          api.applyImpulse([
            forceDirection[0] * forceStrength,
            forceDirection[1] * forceStrength,
            forceDirection[2] * forceStrength
          ], [0, 0, 0]);
        }
      }
    }, 50); // Check every 50ms
    
    // Clear force field after 2 seconds
    const clearTimer = setTimeout(() => {
      clearInterval(forceInterval);
    }, 2000);
    
    return () => {
      clearInterval(forceInterval);
      clearTimeout(clearTimer);
    };
  }, [api, ref]);

  // Detect mobile for shadow optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Use shared geometry and material for better performance
  return (
    <mesh
      ref={ref}
      castShadow={!isMobile}
      receiveShadow={!isMobile}
      geometry={sharedFragmentGeometry}
      material={sharedFragmentMaterial}
      scale={size}
    />
  );
});

// LetterCollider removed - collision detection now handled directly in Letter component for better performance

// Letter with simplified explosion logic and direct collision detection
const Letter = React.memo(function Letter({
  letter,
  position,
  index,
  shouldExplode,
  ballVelocity,
  onCollide,
  isLowPerformance,
}) {
  const [exploded, setExploded] = useState(false);
  const [letterVisible, setLetterVisible] = useState(true);
  const [fragments, setFragments] = useState([]);
  const fragmentsRef = useRef(null);
  const explodedRef = useRef(false); // Prevent multiple collision triggers
  
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: [3.8, 4.5, 4.5], // Slightly larger collision box for better detection
    material: { restitution: 0.3 },
    userData: { type: "letter", letter, index },
    collisionFilterGroup: 2, // Letters in group 2
    collisionFilterMask: 1, // Only collide with balls (group 1)
    onCollide: (e) => {
      // Optimize collision detection with early returns
      if (explodedRef.current || e.body.userData?.type !== "ball") return;
      
      // Immediately mark as exploded to prevent duplicate triggers
      explodedRef.current = true;
      
      // Use requestAnimationFrame to defer heavy operations
      requestAnimationFrame(() => {
        // Disable collision immediately
        api.position.set(0, -1000, 0);
        api.mass.set(0);
        api.collisionFilterGroup.set(0);
        api.collisionFilterMask.set(0);
        
        // Trigger parent collision handler for coordinated explosion
        onCollide?.(index, e.body.velocity || ballVelocity || [0, 0, -25]);
        
        // Trigger local explosion with minimal delay
        setExploded(true);
        setLetterVisible(false);
        
        // Defer fragment creation to next frame to prevent stutter
        requestAnimationFrame(() => {
          createLetterFragments(position, e.body.velocity || ballVelocity);
        });
      });
    },
  }));

  // Generate fragment data without creating physics objects - optimized count for performance
  const generateFragmentData = (count, letterChar) => {
    const fragmentData = [];
    const optimizedCount = Math.min(count, 15); // Allow up to 15 fragments for dramatic raining effect

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

      // Process fragments in larger batches to reduce frame spreading overhead
      const processFragmentBatch = (startIndex = 0) => {
        const batchSize = 8; // Larger batch size to reduce overhead
        const endIndex = Math.min(
          startIndex + batchSize,
          fragmentsRef.current.length
        );

        const newFragments = [];

        for (let i = startIndex; i < endIndex; i++) {
          const fragData = fragmentsRef.current[i];
          const maxDistance = 2.5; // Optimal spread for ideal fragment distribution
          const distance = fragData.distanceWeight * maxDistance;

          // Fragments spawn at moderate distance for natural fall pattern
          const minDistance = 2.5; // Moderate distance so fragments fall near original position
          const safeDistance = Math.max(distance, minDistance);

          const fragPos = [
            impactPoint[0] +
              safeDistance * Math.sin(fragData.phi) * Math.cos(fragData.theta),
            Math.max(
              impactPoint[1] +
                safeDistance *
                  Math.sin(fragData.phi) *
                  Math.sin(fragData.theta) +
                1.0, // Moderate spawn height for natural fall
              0.8 // Above letter level but not too high
            ),
            impactPoint[2] + safeDistance * Math.cos(fragData.phi),
          ];

          const sizeScale = 0.8 + 0.4 * (1 - fragData.distanceWeight);
          const size = fragData.size.map((s) => s * sizeScale);

          const velocityScale = 15 * (1 - fragData.distanceWeight * 0.4); // Fine-tuned velocity for optimal spread
          const upwardBoost = 5; // Optimal upward boost for perfect arcs

          // Add moderate randomness for natural variation
          const randomBoost = 0.8 + Math.random() * 0.4; // Random multiplier between 0.8-1.2
          const randomUpward = upwardBoost * (0.9 + Math.random() * 0.2); // Slight upward variation
          
          const velocity = [
            ((fragPos[0] - impactPoint[0]) * velocityScale * 1.1 + 
              normalizedDirection[0] * velocityScale * 0.4) * randomBoost, // Optimal horizontal spread
            randomUpward + (fragPos[1] - impactPoint[1]) * velocityScale * 0.7 + 
              Math.abs(normalizedDirection[1]) * velocityScale * 0.3, // Perfect arcing trajectories
            ((fragPos[2] - impactPoint[2]) * velocityScale * 1.1 + 
              normalizedDirection[2] * velocityScale * 0.4) * randomBoost, // Optimal depth spread
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
    // Reduce fragment count on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const fragmentCount = isMobile ? 8 : 15; // 8 on mobile, 15 on desktop
    fragmentsRef.current = generateFragmentData(fragmentCount, letter);
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
            bevelSegments={isLowPerformance ? 6 : 12}
            curveSegments={isLowPerformance ? 18 : 36}
            castShadow={!isLowPerformance}
            receiveShadow={!isLowPerformance}
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
function Scene({ onComplete, isLowPerformance }) {
  const letters = "Kirill.Agency";
  const letterArray = letters.split("");

  // Define custom spacing for each letter based on visual width - increased for better kerning
  const letterSpacing = {
    K: 5.2,
    i: 2.2,
    r: 3.7,
    l: 2.3,
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

  // Optimize shadow map size based on performance
  const shadowMapSize = isLowPerformance ? [512, 512] : [2048, 2048];

  return (
    <>
      {/* Increased ambient light for more even base illumination */}
      <ambientLight intensity={1.0} />

      {/* Main directional light centered above the text */}
      <directionalLight
        position={[0, 15, 10]}
        intensity={1.2}
        castShadow={!isLowPerformance} // Disable shadows on mobile
        shadow-mapSize={shadowMapSize}
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
        castShadow={!isLowPerformance} // Disable shadows on mobile
        shadow-mapSize={shadowMapSize}
        shadow-bias={-0.001}
      />

      {/* Subtle fill lights from sides for balanced illumination */}
      {!isLowPerformance && <pointLight position={[-12, 8, 8]} intensity={0.7} color="#ffffff" />}
      {!isLowPerformance && <pointLight position={[12, 8, 8]} intensity={0.4} color="#ffffff" />}

      {/* Additional targeted lighting for "Kirill" to brighten it */}
      {!isLowPerformance && <pointLight position={[-8, 6, 12]} intensity={0.8} color="#ffffff" />}
      {!isLowPerformance && (
        <directionalLight
          position={[-10, 10, 8]}
          intensity={0.6}
          color="#ffffff"
        />
      )}

      <Ground />
      <TennisBall isLowPerformance={isLowPerformance} />

      {/* Collision detection handled directly in Letter components */}

      {/* Render letters */}
      {letterPositions.map((item, i) => (
        <Letter
          key={i}
          letter={item.letter}
          position={item.position}
          index={i}
          shouldExplode={wordExploded && lettersToExplode.includes(i)}
          ballVelocity={ballImpactVelocity}
          onCollide={handleLetterCollision}
          isLowPerformance={isLowPerformance}
        />
      ))}
    </>
  );
}

export default function FallingText({ onComplete }) {
  const cameraSettings = useResponsiveCamera();
  const { isMobile, isLowPerformance } = cameraSettings;

  return (
    <div className={styles.canvasContainer}>
      <Canvas
        shadows={isLowPerformance ? "basic" : "soft"}
        camera={{
          position: cameraSettings.position,
          rotation: [-0.35, -0.5, -0.2],
          fov: cameraSettings.fov,
        }}
        gl={{
          // Reduce quality on mobile for better performance
          antialias: !isLowPerformance,
          powerPreference: isLowPerformance ? "low-power" : "high-performance",
          alpha: true,
          stencil: false,
        }}
        dpr={isLowPerformance ? [1, 1] : [1, 2]} // Limit pixel ratio on mobile
      >
        <Physics
          gravity={[0, -20, 0]}
          defaultContactMaterial={{ restitution: 0.7 }}
          iterations={isLowPerformance ? 6 : 10} // Reduce physics iterations on mobile
          tolerance={0.01}
          broadphase="SAP"
          allowSleep={true}
        >
          <Scene onComplete={onComplete} isLowPerformance={isLowPerformance} />
        </Physics>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          autoRotate={!isLowPerformance} // Disable auto-rotate on mobile
          autoRotateSpeed={0.3}
          target={[0, 0, 0]}
        />
        {!isLowPerformance && <Environment preset="sunset" />}
      </Canvas>
    </div>
  );
}
