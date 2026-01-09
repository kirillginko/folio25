"use client";
import React from "react";
import styles from "../styles/heroBio.module.css";

const HeroBio = () => {
  return (
    <div className={styles.heroContainer}>
      <p className={styles.bioText}>
        Kirill Ginko — I am developer and visual artist focused on shaping
        immersive, design-driven digital experiences. I create work that merges
        visual storytelling with interactive design.
      </p>
    </div>
  );
};

export default HeroBio;
