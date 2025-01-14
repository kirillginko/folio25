"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const [showAbout, setShowAbout] = useState(true);
  const [showBrushCanvas, setShowBrushCanvas] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showThemeButton, setShowThemeButton] = useState(true);

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
