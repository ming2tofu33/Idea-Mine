"use client";

import { useEffect, useRef } from "react";

// --- Types ---

interface Star {
  x: number;
  y: number;
  baseSize: number;
  baseOpacity: number;
  color: "white" | "cyan" | "metal";
  twinkleSpeed: number;
  twinkleAmplitude: number;
  phase: number;
  hasGlow: boolean;
  // Micro-drift: very slow random floating
  driftVx: number;
  driftVy: number;
}

const STAR_COUNT = 150;
const PARALLAX_STRENGTH = 15;

function createStar(w: number, h: number): Star {
  const rand = Math.random();
  // ~8% cyan, ~5% metal, rest white — NO pink
  const color: Star["color"] =
    rand < 0.08 ? "cyan" : rand < 0.13 ? "metal" : "white";

  const isBright = Math.random() < 0.08;

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    baseSize: 0.5 + Math.random() * 1.2,
    baseOpacity: 0.2 + Math.random() * 0.4,
    color,
    twinkleSpeed: 0.0006 + Math.random() * 0.002,
    // Very small twinkle amplitude: 0.02–0.06
    twinkleAmplitude: 0.02 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    hasGlow: isBright || color === "cyan",
    // Micro-drift: 0.01–0.02 px/frame max, random direction
    driftVx: (Math.random() - 0.5) * 0.04, // max ±0.02
    driftVy: (Math.random() - 0.5) * 0.04,
  };
}

const COLOR_MAP = {
  white: [239, 244, 255], // #EFF4FF
  cyan: [92, 205, 229], // #5CCDE5
  metal: [217, 226, 240], // #D9E2F0
} as const;

// --- Component ---

export function VaultBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const nebulaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: STAR_COUNT }, () =>
          createStar(w, h),
        );
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    }

    function animate() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      timeRef.current += 1;
      const t = timeRef.current;

      // Smooth mouse lerp
      smoothMouseRef.current.x +=
        (mouseRef.current.x - smoothMouseRef.current.x) * 0.025;
      smoothMouseRef.current.y +=
        (mouseRef.current.y - smoothMouseRef.current.y) * 0.025;
      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      // Nebula CSS layers follow mouse (slower than stars)
      if (nebulaRef.current) {
        nebulaRef.current.style.transform = `translate(${mx * -5}px, ${my * -5}px)`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        // Micro-drift: very slow random floating in place
        star.x += star.driftVx;
        star.y += star.driftVy;

        // Wrap around edges softly
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        // Mouse parallax — uniform depth, lower strength
        const px = star.x + mx * PARALLAX_STRENGTH;
        const py = star.y + my * PARALLAX_STRENGTH;

        // Skip if off screen
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        // Twinkle — very small amplitude
        const twinkle =
          Math.sin(t * star.twinkleSpeed + star.phase) * star.twinkleAmplitude;
        const opacity = Math.max(
          0.02,
          Math.min(1, star.baseOpacity + twinkle),
        );
        const size = Math.max(0.2, star.baseSize * (1 + twinkle * 0.3));

        const [r, g, b] = COLOR_MAP[star.color];

        // NO cross rays for vault

        // Glow halo — subtle
        if (star.hasGlow && size > 0.5) {
          ctx.shadowBlur = size * 6;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`;
        } else {
          ctx.shadowBlur = 0;
        }

        // Star body
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        if (star.hasGlow) {
          ctx.shadowBlur = 0;
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

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
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Nebula layers — 1-2 very faint, positioned toward edges */}
      <div
        ref={nebulaRef}
        className="absolute -inset-8 transition-transform duration-700 ease-out"
        style={{
          background: [
            "radial-gradient(ellipse 70% 50% at 12% 20%, rgba(12, 21, 36, 0.2) 0%, transparent 65%)",
            "radial-gradient(ellipse 55% 45% at 88% 78%, rgba(18, 29, 49, 0.15) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Cyan ambient glow from below — faint, NO pink */}
      <div
        className="absolute inset-0"
        style={{
          animation: "vaultGlowPulse 16s ease-in-out infinite",
          background:
            "radial-gradient(ellipse 90% 40% at 50% 100%, rgba(92, 205, 229, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Canvas — stars with micro-drift + parallax + twinkle + glow */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Vignette — slightly less intense than Mine */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 0%, rgba(2, 5, 13, 0.28) 100%)",
        }}
      />

      <style>{`
        @keyframes vaultGlowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
