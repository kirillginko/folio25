"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/email.module.css";
import { gsap } from "gsap";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { useGlobalState } from "../context/GlobalStateContext";

const Email = () => {
  const containerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationState, setNotificationState] = useState({
    show: false,
    message: "",
    type: "success", // or 'error'
  });
  const { showEmail, setShowBackdrop, setActiveComponent } = useGlobalState();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Animation for expanding/minimizing
    if (containerRef.current) {
      if (!isMinimized) {
        // Expand animation
        gsap.fromTo(
          containerRef.current.children[1], // The designContainer
          {
            height: "40px",
            width: "100px",
            borderRadius: "30px",
          },
          {
            height: "550px",
            width: "380px",
            borderRadius: "16px",
            duration: 0.3,
            ease: "power2.out",
          }
        );
      } else {
        // Minimize animation
        gsap.to(containerRef.current.children[1], {
          height: "40px",
          width: "100px",
          borderRadius: "30px",
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [isMinimized]);

  const toggleMinimized = () => {
    if (!isMinimized) {
      // When minimizing, hide the backdrop
      setShowBackdrop(false);
      setActiveComponent(null);
    } else if (isMobile) {
      // When expanding on mobile, show the backdrop
      setShowBackdrop(true);
      setActiveComponent("email"); // Set this to your email component identifier
    }

    setIsMinimized((prev) => !prev);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromEmail,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      await response.json();

      setIsSent(true);
      setFromEmail("");
      setMessage("");
      setNotificationState({
        show: true,
        message: "Message sent successfully!",
        type: "success",
      });

      // Hide notification and minimize after 3 seconds
      setTimeout(() => {
        setIsSent(false);
        setIsMinimized(true);
        setNotificationState((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3000);
    } catch (err) {
      console.error("Send error:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setNotificationState({
        show: true,
        message: err.message || "Failed to send message",
        type: "error",
      });

      // Hide error notification after 3 seconds
      setTimeout(() => {
        setNotificationState((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobileDetected = window.innerWidth <= 768;
      setIsMobile(mobileDetected);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div style={{ display: showEmail ? "block" : "none" }}>
      <div
        ref={containerRef}
        className={`${styles.draggableWrapper}`}
        style={{
          ...(!(isMobile && !isMinimized) && {
            position: "fixed",
            // Your positioning properties
          }),
          zIndex: isMobile && !isMinimized ? 10000 : "auto", // Higher than backdrop when expanded on mobile
        }}
      >
        {notificationState.show && (
          <div
            className={`${styles.notification} ${
              styles[notificationState.type]
            }`}
          >
            {notificationState.message}
          </div>
        )}
        <div className={styles.expandButton} onClick={toggleMinimized}>
          {isMinimized ? (
            <BsArrowsAngleExpand className={styles.toggleIcon} />
          ) : (
            <BsArrowsAngleContract className={styles.toggleIcon} />
          )}
        </div>

        <div
          className={`${styles.designContainer} ${
            isMinimized ? styles.minimizedContainer : styles.normalContainer
          }`}
        >
          {isMinimized ? (
            <div className={styles.minimizedContent}>
              <span className={styles.minimizedText}>Contact</span>
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <div className={styles.header}>
                <span>FROM: </span>
                <input
                  className={styles.headerInput}
                  type="email"
                  placeholder="[Your Email Here]"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.content}>
                <textarea
                  className={styles.messageInput}
                  placeholder="Hi my name is"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <div className={styles.footer}>
                  <span className={styles.email}>HELLO@KIRILL.AGENCY</span>
                  <button
                    type="submit"
                    className={`${styles.submitButton} ${
                      isLoading ? styles.loading : ""
                    }`}
                    disabled={isLoading}
                  >
                    SEND MESSAGE
                  </button>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {isSent && <p className={styles.confirmation}>Message Sent!</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Email;
