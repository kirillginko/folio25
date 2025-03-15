"use client"; // Ensure this is a client component

import React from "react";
import { useGLTF } from "@react-three/drei";

const Model = (props) => {
  const { scene } = useGLTF("/model/tennis.glb");

  // Clone the scene to avoid mutations
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);

  // Optimize model for physics
  React.useEffect(() => {
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return <primitive object={clonedScene} {...props} />;
};

export default Model;
