import React from "react";
import FastMarquee from "react-fast-marquee";
import styles from "../styles/marquee.module.css";

function Marquee() {
  return (
    <FastMarquee speed={50} gradient={false} className={styles.marquee}>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
      <span className={styles.item}>kirill.agency</span>
      <span className={styles.item}>•</span>
    </FastMarquee>
  );
}

export default Marquee;
