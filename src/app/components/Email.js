"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/email.module.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

const Email = () => {
  const containerRef = useRef(null);
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const draggableInstance = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
          gsap.to(containerRef.current, {
            x: windowWidth - rect.width - 20,
            duration: 0.3,
          });
        }
        if (rect.bottom > windowHeight) {
          gsap.to(containerRef.current, {
            y: windowHeight - rect.height - 20,
            duration: 0.3,
          });
        }
        if (rect.left < 0) {
          gsap.to(containerRef.current, {
            x: 20,
            duration: 0.3,
          });
        }
        if (rect.top < 0) {
          gsap.to(containerRef.current, {
            y: 20,
            duration: 0.3,
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(Draggable);

    const createDraggable = () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      draggableInstance.current = Draggable.create(containerRef.current, {
        type: "x,y",
        bounds: window,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: isMinimized ? 0.85 : 0.65,
        dragResistance: isMinimized ? 0.1 : 0.05,
        zIndexBoost: true,
        onDragStart: function () {
          gsap.to(this.target, {
            scale: isMinimized ? 1.05 : 1.1,
            duration: 0.2,
          });
        },
        onDragEnd: function () {
          gsap.to(this.target, { scale: 1, duration: 0.2 });
        },
      })[0];
    };

    createDraggable();

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [isMinimized]);

  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  const toggleMinimized = () => {
    if (isMinimized) {
      gsap.to(formRef.current, {
        width: 350,
        height: 500,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => setIsMinimized(false),
      });
    } else {
      gsap.to(formRef.current, {
        width: 150,
        height: 50,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => setIsMinimized(true),
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!fromEmail.trim() || !message.trim()) {
      setError("Please fill out both email and message fields.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromEmail,
          toEmail: "kirillginko@gmail.com",
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setIsSent(true);
      setFromEmail("");
      setMessage("");
      setTimeout(() => {
        setIsSent(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending email:", error);
      setError(error.message || "Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className={styles.draggableWrapper}>
      <div className={styles.greenCircle} onClick={toggleMinimized}></div>

      <div
        ref={formRef}
        className={`${styles.designContainer} ${
          isMinimized ? styles.minimizedContainer : styles.normalContainer
        }`}
      >
        {isMinimized ? (
          <div className={styles.minimizedContent}>
            <span className={styles.minimizedText}>Email</span>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div className={styles.header}>
              <span>From: </span>
              <input
                type="email"
                placeholder="Your Email Here"
                className={styles.headerInput}
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                onClick={handleInputClick}
                required
              />
            </div>

            <div className={styles.content}>
              <textarea
                className={styles.messageInput}
                placeholder="Hi Kirill, Lets Work Together!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onClick={handleInputClick}
                required
              />
              <div className={styles.footer}>
                <button
                  type="submit"
                  className={`${styles.sendButton} ${
                    isLoading ? styles.loading : ""
                  }`}
                  disabled={isLoading}
                >
                  SEND MESSAGE
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {isSent && <p className={styles.confirmation}>Message Sent!</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Email;
