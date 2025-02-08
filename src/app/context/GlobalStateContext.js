"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const [showAbout, setShowAbout] = useState(true);
  const [showBrushCanvas, setShowBrushCanvas] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showThemeButton, setShowThemeButton] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isMusicPlayerMinimized, setIsMusicPlayerMinimized] = useState(false);

  return (
    <GlobalStateContext.Provider
      value={{
        showAbout,
        setShowAbout,
        showBrushCanvas,
        setShowBrushCanvas,
        showMusicPlayer,
        setShowMusicPlayer,
        showEmail,
        setShowEmail,
        showThemeButton,
        setShowThemeButton,
        isTransitioning,
        setIsTransitioning,
        isRotating,
        setIsRotating,
        isMusicPlayerMinimized,
        setIsMusicPlayerMinimized,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
}
