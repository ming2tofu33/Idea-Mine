"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/shared/use-prefers-reduced-motion";

interface Star {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  baseOpacity: number;
  color: "white" | "pink" | "cyan";
  twinkleSpeed: number;
  twinkleAmplitude: number;
  phase: number;
  hasGlow: boolean;
  hasCross: boolean;
}

type ObservatoryVariant = "landing" | "mine";
type ObservatoryIntensity = "hero" | "default" | "quiet";

export type ObservatoryBackgroundProps = {
  variant?: ObservatoryVariant;
  intensity?: ObservatoryIntensity;
  className?: string;
};

const BASE_STAR_COUNT = 500;
const BASE_PARALLAX_STRENGTH = 35;
const DRIFT_SPEED = 0.00012;

const COLOR_MAP = {
  white: [239, 244, 255],
  pink: [255, 59, 147],
  cyan: [92, 205, 229],
} as const;

const INTENSITY_PRESETS = {
  hero: {
    starMultiplier: 1.25,
    parallaxMultiplier: 1.2,
    nebulaOpacity: 1,
    pinkPulseOpacity: 1,
    vignetteOpacity: 0.3,
  },
  default: {
    starMultiplier: 1,
    parallaxMultiplier: 1,
    nebulaOpacity: 0.9,
    pinkPulseOpacity: 0.8,
    vignetteOpacity: 0.35,
  },
  quiet: {
    starMultiplier: 0.72,
    parallaxMultiplier: 0.72,
    nebulaOpacity: 0.62,
    pinkPulseOpacity: 0.5,
    vignetteOpacity: 0.45,
  },
} as const;

function createStar(w: number, h: number, forceZ?: number): Star {
  const rand = Math.random();
  const color: Star["color"] =
    rand < 0.07 ? "pink" : rand < 0.12 ? "cyan" : "white";

  const zRand = Math.random();
  const z =
    forceZ ??
    (zRand < 0.7
      ? Math.random() * 0.3
      : zRand < 0.9
        ? 0.3 + Math.random() * 0.3
        : 0.6 + Math.random() * 0.4);
  const isBright = Math.random() < 0.1;

  return {
    x: w * 0.5 + (Math.random() - 0.5) * w * 2,
    y: h * 0.5 + (Math.random() - 0.5) * h * 2,
    z,
    baseSize: 0.8 + z * 2,
    baseOpacity: 0.25 + z * 0.45,
    color,
    twinkleSpeed: 0.0008 + Math.random() * 0.003,
    twinkleAmplitude: isBright
      ? 0.25 + Math.random() * 0.2
      : 0.04 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
    hasGlow: isBright || color !== "white",
    hasCross: isBright && z > 0.6,
  };
}

function drawCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  r: number,
  g: number,
  b: number,
  opacity: number,
) {
  const len = size * 4;
  const grad1 = ctx.createLinearGradient(x - len, y, x + len, y);
  const grad2 = ctx.createLinearGradient(x, y - len, x, y + len);
  const center = `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`;
  const edge = `rgba(${r}, ${g}, ${b}, 0)`;

  grad1.addColorStop(0, edge);
  grad1.addColorStop(0.5, center);
  grad1.addColorStop(1, edge);

  grad2.addColorStop(0, edge);
  grad2.addColorStop(0.5, center);
  grad2.addColorStop(1, edge);

  ctx.lineWidth = size * 0.3;

  ctx.beginPath();
  ctx.moveTo(x - len, y);
  ctx.lineTo(x + len, y);
  ctx.strokeStyle = grad1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x, y + len);
  ctx.strokeStyle = grad2;
  ctx.stroke();
}

export function ObservatoryBackground({
  variant = "mine",
  intensity = "default",
  className = "",
}: ObservatoryBackgroundProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateMotion = prefersReducedMotion === false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const nebulaRef = useRef<HTMLDivElement>(null);

  const preset = INTENSITY_PRESETS[intensity];
  const starCount = Math.round(BASE_STAR_COUNT * preset.starMultiplier);
  const parallaxStrength = BASE_PARALLAX_STRENGTH * preset.parallaxMultiplier;

  const nebulaBackground = useMemo(() => {
    if (variant === "landing") {
      return [
        "radial-gradient(ellipse 85% 65% at 16% 20%, rgba(12, 21, 36, 0.58) 0%, transparent 72%)",
        "radial-gradient(ellipse 70% 58% at 82% 24%, rgba(18, 29, 49, 0.42) 0%, transparent 68%)",
        "radial-gradient(ellipse 95% 65% at 52% 90%, rgba(12, 21, 36, 0.34) 0%, transparent 58%)",
        "radial-gradient(ellipse 45% 40% at 72% 72%, rgba(18, 29, 49, 0.28) 0%, transparent 62%)",
      ].join(", ");
    }

    return [
      "radial-gradient(ellipse 80% 60% at 18% 25%, rgba(12, 21, 36, 0.5) 0%, transparent 70%)",
      "radial-gradient(ellipse 60% 50% at 82% 72%, rgba(18, 29, 49, 0.4) 0%, transparent 65%)",
      "radial-gradient(ellipse 100% 70% at 50% 90%, rgba(12, 21, 36, 0.3) 0%, transparent 55%)",
      "radial-gradient(ellipse 40% 35% at 65% 20%, rgba(18, 29, 49, 0.2) 0%, transparent 60%)",
    ].join(", ");
  }, [variant]);

  const pinkPulseBackground = useMemo(() => {
    if (variant === "landing") {
      return [
        "radial-gradient(circle 460px at 20% 32%, rgba(255, 59, 147, 0.1) 0%, transparent 74%)",
        "radial-gradient(circle 360px at 76% 24%, rgba(255, 59, 147, 0.075) 0%, transparent 72%)",
      ].join(", ");
    }

    return [
      "radial-gradient(circle 400px at 22% 35%, rgba(255, 59, 147, 0.08) 0%, transparent 70%)",
      "radial-gradient(circle 300px at 78% 68%, rgba(255, 59, 147, 0.06) 0%, transparent 70%)",
    ].join(", ");
  }, [variant]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvasEl!.width = w * dpr;
      canvasEl!.height = h * dpr;
      canvasEl!.style.width = `${w}px`;
      canvasEl!.style.height = `${h}px`;

      if (starsRef.current.length < starCount) {
        starsRef.current.push(
          ...Array.from({ length: starCount - starsRef.current.length }, () =>
            createStar(w, h),
          ),
        );
      } else if (starsRef.current.length > starCount) {
        starsRef.current.length = starCount;
      }

      if (!animateMotion) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    }

    function animate() {
      const ctx = canvasEl!.getContext("2d");
      if (!ctx) return;

      const w = canvasEl!.width / dpr;
      const h = canvasEl!.height / dpr;
      const cx = w / 2;
      const cy = h / 2;

      timeRef.current += 1;
      const t = timeRef.current;

      let mx = 0;
      let my = 0;
      if (animateMotion) {
        smoothMouseRef.current.x +=
          (mouseRef.current.x - smoothMouseRef.current.x) * 0.025;
        smoothMouseRef.current.y +=
          (mouseRef.current.y - smoothMouseRef.current.y) * 0.025;
        mx = smoothMouseRef.current.x;
        my = smoothMouseRef.current.y;
      } else {
        smoothMouseRef.current.x = 0;
        smoothMouseRef.current.y = 0;
      }

      if (nebulaRef.current) {
        nebulaRef.current.style.transform = animateMotion
          ? `translate(${mx * -8}px, ${my * -8}px)`
          : "translate(0px, 0px)";
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        if (animateMotion) {
          star.z += DRIFT_SPEED * (0.2 + star.z * star.z * 3);
        }

        if (star.z > 1.1) {
          Object.assign(star, createStar(w, h, 0.01 + Math.random() * 0.1));
        }

        const scale = 0.2 + star.z * star.z * 1.2;
        const projX = cx + (star.x - cx) * scale;
        const projY = cy + (star.y - cy) * scale;

        const px = projX + mx * star.z * parallaxStrength;
        const py = projY + my * star.z * parallaxStrength;

        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        const twinkle = animateMotion
          ? 0
          : Math.sin(t * star.twinkleSpeed + star.phase) * star.twinkleAmplitude;
        const opacity = Math.max(
          0.02,
          Math.min(1, star.baseOpacity * star.z + twinkle),
        );
        const size = Math.max(0.2, star.baseSize * star.z * (1 + twinkle * 0.3));

        const [r, g, b] = COLOR_MAP[star.color];

        if (star.hasCross && size > 1.2) {
          drawCross(ctx, px, py, size, r, g, b, opacity);
        }

        if (star.hasGlow && size > 0.6) {
          ctx.shadowBlur = size * 8;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      if (animateMotion) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    resize();
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    if (animateMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (animateMotion) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [animateMotion, parallaxStrength, starCount]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      <div
        ref={nebulaRef}
        className="absolute -inset-8 transition-transform duration-700 ease-out"
        style={{
          opacity: preset.nebulaOpacity,
          background: nebulaBackground,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          opacity: preset.pinkPulseOpacity,
          animation: animateMotion ? "observatoryGlowPulse 12s ease-in-out infinite" : "none",
          background: pinkPulseBackground,
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 0%, rgba(2, 5, 13, ${preset.vignetteOpacity}) 100%)`,
        }}
      />
    </div>
  );
}
