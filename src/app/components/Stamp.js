"use client";
import React from "react";
import styles from "../styles/stamp.module.css";

const Stamp = () => {
  return (
    <div className={styles.okokMeter}>
      <p className={styles.text}>
        <span className={styles.bold}>This Website</span> IS DESIGNED,
        MANUFACTURED, AND PRODUCED
      </p>
      <p className={styles.text}>
        BY <span className={styles.boldOutline}>Kirill.SERVICES</span>
      </p>
      <div className={styles.icons}>
        <span className={styles.recycleIcon}>♻ツ</span>
        <span>░</span>
        <span className={styles.text}>EMOTIONAL Web Design</span>
      </div>
      <p className={styles.text}>
        © {new Date().getFullYear()} PROPERTY OF Kirill.Studio SERVICES
      </p>
    </div>
  );
};

export default Stamp;
