"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const [showAbout, setShowAbout] = useState(true);
  const [showBrushCanvas, setShowBrushCanvas] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showThemeButton, setShowThemeButton] = useState(true);
  const [showWorkButton, setShowWorkButton] = useState(true);
  const [showAnalogClock, setShowAnalogClock] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isMusicPlayerMinimized, setIsMusicPlayerMinimized] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);

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
        showWorkButton,
        setShowWorkButton,
        showAnalogClock,
        setShowAnalogClock,
        isTransitioning,
        setIsTransitioning,
        isRotating,
        setIsRotating,
        isMusicPlayerMinimized,
        setIsMusicPlayerMinimized,
        showBackdrop,
        setShowBackdrop,
        activeComponent,
        setActiveComponent,
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
