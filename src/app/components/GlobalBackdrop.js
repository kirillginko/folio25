"use client";
import { useGlobalState } from "../context/GlobalStateContext";
import { useEffect } from "react";

export default function GlobalBackdrop() {
  const {
    showBackdrop,
    activeComponent,
    setActiveComponent,
    setShowAbout,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
  } = useGlobalState();

  // Handle click events only on client-side to avoid hydration issues
  useEffect(() => {
    const handleBackdropClick = () => {
      if (activeComponent === "about") {
        document.querySelector(".about-toggle-button")?.click();
      } else if (activeComponent === "brushcanvas") {
        document.querySelector(".brushcanvas-toggle-button")?.click();
      } else if (activeComponent === "clock") {
        document.querySelector(".clock-toggle-button")?.click();
      } else if (activeComponent === "image") {
        // Reset the UI state when clicking on backdrop with an expanded image
        setActiveComponent(null);
        setShowAbout(true);
        setShowBrushCanvas(true);
        setShowMusicPlayer(true);
        setShowEmail(true);
      }
    };

    const backdropElement = document.querySelector(".global-backdrop");
    if (backdropElement) {
      backdropElement.addEventListener("click", handleBackdropClick);
    }

    return () => {
      if (backdropElement) {
        backdropElement.removeEventListener("click", handleBackdropClick);
      }
    };
  }, [
    activeComponent,
    setActiveComponent,
    setShowAbout,
    setShowBrushCanvas,
    setShowMusicPlayer,
    setShowEmail,
  ]);

  if (!showBackdrop) return null;

  return (
    <div
      className="global-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 9999,
      }}
    />
  );
}
