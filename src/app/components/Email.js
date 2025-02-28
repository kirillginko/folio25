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
  const [isAnimating, setIsAnimating] = useState(false);
  const [notificationState, setNotificationState] = useState({
    show: false,
    message: "",
    type: "success", // or 'error'
  });
  const { showEmail } = useGlobalState();

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
            height: window.innerWidth <= 768 ? "100vh" : "550px",
            width: window.innerWidth <= 768 ? "100vw" : "380px",
            borderRadius: window.innerWidth <= 768 ? "0px" : "16px",
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
    setIsAnimating(true);
    setIsMinimized((prev) => !prev);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
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

      const data = await response.json();

      setIsSent(true);
      setNotificationState({
        show: true,
        message: "Message sent successfully!",
        type: "success",
      });

      // Hide notification and minimize after 1 second, clear fields after animation
      setTimeout(() => {
        setIsSent(false);
        setIsMinimized(true);
        setNotificationState((prev) => ({
          ...prev,
          show: false,
        }));

        // Clear fields after minimizing animation completes
        setTimeout(() => {
          setFromEmail("");
          setMessage("");
        }, 300); // 300ms matches the GSAP animation duration
      }, 1000);
    } catch (err) {
      console.error("Send error:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setNotificationState({
        show: true,
        message: err.message || "Failed to send message",
        type: "error",
      });

      // Hide error notification after 1 second instead of 3
      setTimeout(() => {
        setNotificationState((prev) => ({
          ...prev,
          show: false,
        }));
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: showEmail ? "block" : "none" }}>
      <div ref={containerRef} className={styles.draggableWrapper}>
        {notificationState.show && (
          <div
            className={`${styles.notification} ${
              styles[notificationState.type]
            }`}
          >
            {notificationState.message}
          </div>
        )}
        <div
          className={`${styles.greenCircle} ${
            !isMinimized ? styles.mobileFixed : ""
          }`}
          onClick={toggleMinimized}
        >
          {isMinimized ? (
            <BsArrowsAngleExpand className={styles.toggleIcon} />
          ) : (
            <BsArrowsAngleContract className={styles.toggleIcon} />
          )}
        </div>

        <div
          className={`${styles.designContainer} ${
            isMinimized ? styles.minimizedContainer : styles.normalContainer
          } ${!isMinimized ? styles.mobileFullscreen : ""}`}
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
