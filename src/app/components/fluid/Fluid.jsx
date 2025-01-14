import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import styles from "../../styles/fluid.module.css";
import { ripplesVs, ripplesFs, renderFs } from "./Shaders";
import { useTheme } from "next-themes";
const Curtains = dynamic(() => import("curtainsjs"), { ssr: false });
const FluidBackground = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const renderPassRef = useRef(null);
  const { theme, resolvedTheme } = useTheme();
  const [backgroundColor, setBackgroundColor] = useState([0, 0, 0]);
  useImperativeHandle(ref, () => ({
    changeRippleColor: (r, g, b) => {
      if (renderPassRef.current) {
        renderPassRef.current.uniforms.rippleColor.value = [
          r / 255,
          g / 255,
          b / 255,
        ];
      }
    },
  }));
  useEffect(() => {
    const getBackgroundColor = () => {
      try {
        const currentTheme = resolvedTheme || theme;

        // Return pure white for light theme and darker color for dark theme
        return currentTheme === "dark"
          ? [0.1, 0.1, 0.1] // Dark theme (keep existing dark color)
          : [0.99, 0.99, 0.99]; // Light theme (almost pure white)
      } catch (error) {
        console.warn("Error getting background color:", error);
        return [0.98, 0.98, 0.98]; // Default to almost white
      }
    };
    setBackgroundColor(getBackgroundColor());
  }, [theme, resolvedTheme]);
  useEffect(() => {
    let curtains;
    let ripples;
    let renderPass;
    const initCurtains = async () => {
      // Check for WebGL support
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        console.error("WebGL is not supported in this browser.");
        return;
      }
      try {
        const { Curtains, Vec2, PingPongPlane, ShaderPass } = await import(
          "curtainsjs"
        );
        curtains = new Curtains({
          container: canvasRef.current,
          pixelRatio: Math.min(1.5, window.devicePixelRatio),
          alpha: true, // Enable alpha channel
        });
        const mouse = {
          last: new Vec2(),
          current: new Vec2(),
          velocity: new Vec2(),
          updateVelocity: false,
          lastTime: null,
        };
        const curtainsBBox = curtains.getBoundingRect();
        // Create ripples plane
        ripples = new PingPongPlane(curtains, canvasRef.current, {
          vertexShader: ripplesVs,
          fragmentShader: ripplesFs,
          autoloadSources: false,
          watchScroll: false,
          sampler: "uRipples",
          texturesOptions: {
            floatingPoint: "half-float",
          },
          uniforms: {
            mousePosition: {
              name: "uMousePosition",
              type: "2f",
              value: mouse.current,
            },
            velocity: {
              name: "uVelocity",
              type: "2f",
              value: mouse.velocity,
            },
            resolution: {
              name: "uResolution",
              type: "2f",
              value: new Vec2(curtainsBBox.width, curtainsBBox.height),
            },
            pixelRatio: {
              name: "uPixelRatio",
              type: "1f",
              value: curtains.pixelRatio,
            },
            time: {
              name: "uTime",
              type: "1i",
              value: -1,
            },
            viscosity: {
              name: "uViscosity",
              type: "1f",
              value: 10.75,
            },
            speed: {
              name: "uSpeed",
              type: "1f",
              value: 3.75,
            },
            size: {
              name: "uSize",
              type: "1f",
              value: 2,
            },
            dissipation: {
              name: "uDissipation",
              type: "1f",
              value: 0.9875,
            },
          },
        });
        ripples
          .onRender(() => {
            mouse.velocity.set(
              curtains.lerp(mouse.velocity.x, 0, 0.05),
              curtains.lerp(mouse.velocity.y, 0, 0.1)
            );
            ripples.uniforms.velocity.value = mouse.velocity.clone();
            ripples.uniforms.time.value++;
          })
          .onAfterResize(() => {
            const boundingRect = ripples.getBoundingRect();
            ripples.uniforms.resolution.value.set(
              boundingRect.width,
              boundingRect.height
            );
          });
        // Render pass
        const renderPassUniforms = {
          resolution: {
            name: "uResolution",
            type: "2f",
            value: new Vec2(curtainsBBox.width, curtainsBBox.height),
          },
          hue: {
            name: "uHue",
            type: "1f",
            value: 0,
          },
          saturation: {
            name: "uSaturation",
            type: "1f",
            value: 3,
          },
          bgColor: {
            name: "uBgColor",
            type: "3f",
            value: backgroundColor,
          },
          rippleColor: {
            name: "uRippleColor",
            type: "3f",
            value: [46 / 255, 255 / 255, 130 / 255], // #2eff82 normalized to 0-1 range
          },
        };
        renderPass = new ShaderPass(curtains, {
          fragmentShader: renderFs,
          uniforms: renderPassUniforms,
          depth: false,
          transparent: true, // Enable transparency
        });
        renderPassRef.current = renderPass;
        renderPass.onAfterResize(() => {
          const boundingRect = renderPass.getBoundingRect();
          renderPass.uniforms.resolution.value.set(
            boundingRect.width,
            boundingRect.height
          );
        });
        renderPass.createTexture({
          sampler: "uRipplesTexture",
          fromTexture: ripples.getTexture(),
        });
        // Mouse move handler
        const onMouseMove = (e) => {
          if (ripples) {
            const mousePos = {
              x: e.targetTouches ? e.targetTouches[0].clientX : e.clientX,
              y: e.targetTouches ? e.targetTouches[0].clientY : e.clientY,
            };
            mouse.last.copy(mouse.current);
            mouse.updateVelocity = true;
            if (!mouse.lastTime) {
              mouse.lastTime = (performance || Date).now();
            }
            if (
              mouse.last.x === 0 &&
              mouse.last.y === 0 &&
              mouse.current.x === 0 &&
              mouse.current.y === 0
            ) {
              mouse.updateVelocity = false;
            }
            mouse.current.set(mousePos.x, mousePos.y);
            const webglCoords = ripples.mouseToPlaneCoords(mouse.current);
            ripples.uniforms.mousePosition.value = webglCoords;
            if (mouse.updateVelocity) {
              const time = (performance || Date).now();
              const delta = Math.max(14, time - mouse.lastTime);
              mouse.lastTime = time;
              mouse.velocity.set(
                (mouse.current.x - mouse.last.x) / delta,
                (mouse.current.y - mouse.last.y) / delta
              );
            }
          }
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onMouseMove);
        // Clean up function
        return () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("touchmove", onMouseMove);
          if (curtains) {
            curtains.dispose();
          }
        };
      } catch (error) {
        console.error("Error initializing Curtains:", error);
      }
    };
    initCurtains();
    return () => {
      if (curtains) {
        curtains.dispose();
      }
    };
  }, []);
  // Update background color when it changes
  useEffect(() => {
    if (renderPassRef.current) {
      renderPassRef.current.uniforms.bgColor.value = backgroundColor;
    }
  }, [backgroundColor]);
  return (
    <>
      <div ref={canvasRef} className={styles.canvasContainer}></div>
      <div className={styles.overlay}></div>
    </>
  );
});
FluidBackground.displayName = "FluidBackground";
export default FluidBackground;
