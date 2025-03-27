"use client";
import React, { useEffect } from "react";
import styles from "../styles/themeButton.module.css";
import { useGlobalState } from "../context/GlobalStateContext";

const ThemeButton = ({ toggleTheme }) => {
  const { showThemeButton } = useGlobalState();

  useEffect(() => {
    console.log("ThemeButton state updated:", showThemeButton);
  }, [showThemeButton]);

  if (!showThemeButton) {
    console.log("ThemeButton hiding");
    return null;
  }

  console.log("ThemeButton showing");
  return (
    <button onClick={toggleTheme} className={styles.themeButton}>
      Theme
    </button>
  );
};

export default ThemeButton;
