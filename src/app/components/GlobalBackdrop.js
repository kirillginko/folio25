"use client";
import { useGlobalState } from "../context/GlobalStateContext";
import { useEffect } from "react";

export default function GlobalBackdrop() {
  const { showBackdrop, activeComponent } = useGlobalState();

  // Handle click events only on client-side to avoid hydration issues
  useEffect(() => {
    const handleBackdropClick = () => {
      if (activeComponent === "about") {
        document.querySelector(".about-toggle-button")?.click();
      } else if (activeComponent === "brushcanvas") {
        document.querySelector(".brushcanvas-toggle-button")?.click();
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
  }, [activeComponent]);

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
