import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export * from "gsap";
export * from "gsap/dist/Draggable";
