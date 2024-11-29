"use client"; // Ensure this is a client component

import React, { useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const Model = (props) => {
  const { scene } = useGLTF("/tennis.glb");

  return <primitive object={scene} {...props} />;
};

export default Model;
