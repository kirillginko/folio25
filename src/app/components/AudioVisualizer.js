"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const AudioVisualizer = ({ analyserNode }) => {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const barsRef = useRef([]);
  const frameRef = useRef();

  useEffect(() => {
    if (!containerRef.current || !analyserNode) return;

    // Setup scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = null; // Make scene background transparent

    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Setup camera with adjusted view
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      width / height,
      0.1,
      1000
    );
    cameraRef.current.position.z = 25; // Keep same distance for height
    cameraRef.current.position.y = 0; // Keep at bottom

    // Setup renderer with full transparency
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false, // This can help with transparency
    });
    rendererRef.current.setSize(width, height);
    rendererRef.current.setClearColor(0x000000, 0); // Fully transparent
    rendererRef.current.outputColorSpace = THREE.SRGBColorSpace; // Better color handling

    // Clear container and add renderer
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Create bars that span full width
    const numBars = 98; // More bars
    const barWidth = 0.35; // Slightly thinner to fit more
    const spacing = 0.37; // Minimal gap between bars

    const geometry = new THREE.BoxGeometry(barWidth, 1, 0.5);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 100,
    });

    // Calculate total width and adjust spacing to fit container perfectly
    const totalWidth = (numBars - 1) * spacing;

    barsRef.current = [];

    for (let i = 0; i < numBars; i++) {
      const bar = new THREE.Mesh(geometry, material.clone());
      bar.position.x = i * spacing - totalWidth / 2;
      bar.position.y = -2; // Keep at bottom
      sceneRef.current.add(bar);
      barsRef.current.push(bar);
    }

    // Enhanced lighting for better visual feedback
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const pointLight1 = new THREE.PointLight(0xffffff, 1.2);
    const pointLight2 = new THREE.PointLight(0xffffff, 0.8);

    pointLight1.position.set(5, 5, 5);
    pointLight2.position.set(-5, 5, 5);

    sceneRef.current.add(ambientLight);
    sceneRef.current.add(pointLight1);
    sceneRef.current.add(pointLight2);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (analyserNode) {
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray);

        barsRef.current.forEach((bar, i) => {
          // Skip sub-bass and brilliance frequencies by adjusting the frequency range
          const startBin = Math.floor(dataArray.length * 0.1); // Skip first 10% (sub-bass)
          const endBin = Math.floor(dataArray.length * 0.8); // Skip last 20% (brilliance)
          const usableRange = endBin - startBin;

          const freqIndex = Math.floor((i * usableRange) / numBars + startBin);
          const value = dataArray[freqIndex];

          const targetScale = (value / 255) * 10;

          bar.scale.y = THREE.MathUtils.lerp(
            bar.scale.y,
            targetScale || 0.001,
            0.3
          );

          bar.position.y = bar.scale.y / 2 - 2;

          // Keep same color transitions
          const hue = (i / numBars) * 0.3 + 0.6;
          const saturation = 0.8;
          const lightness = 0.4 + targetScale * 0.08;
          bar.material.color.setHSL(hue, saturation, lightness);
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameRef.current);

      // Dispose of geometries and materials
      barsRef.current.forEach((bar) => {
        bar.geometry.dispose();
        bar.material.dispose();
      });

      // Clear scene
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }

      rendererRef.current.dispose();
    };
  }, [analyserNode]); // Add analyserNode as dependency

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};

export default AudioVisualizer;
