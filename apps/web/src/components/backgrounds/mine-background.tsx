"use client";

import { useEffect, useRef } from "react";

// --- Star types & constants ---

interface Star {
  x: number;
  y: number;
  baseSize: number;
  baseOpacity: number;
  depth: number; // 0.2 (far) ~ 1.0 (near)
  speed: number;
  color: "white" | "pink" | "cyan";
  // twinkle
  twinkleSpeed: number;
  twinkleAmplitude: number;
  phase: number;
  // glow
  hasGlow: boolean;
}

const STAR_COUNT = 200;
const PARALLAX_STRENGTH = 30;

function createStar(w: number, h: number): Star {
  const rand = Math.random();
  const color: Star["color"] =
    rand < 0.08 ? "pink" : rand < 0.12 ? "cyan" : "white";

  // 3 depth layers: far (60%), mid (30%), near (10%)
  const depthRand = Math.random();
  const depth = depthRand < 0.6 ? 0.15 + Math.random() * 0.15 // far: 0.15-0.3
    : depthRand < 0.9 ? 0.4 + Math.random() * 0.2             // mid: 0.4-0.6
    : 0.7 + Math.random() * 0.3;                               // near: 0.7-1.0

  const isBright = Math.random() < 0.12;

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    baseSize: depth < 0.35 ? 0.3 + Math.random() * 0.5        // far: tiny
      : depth < 0.65 ? 0.5 + Math.random() * 1.0              // mid: small
      : 1.0 + Math.random() * 1.5,                            // near: visible
    baseOpacity: depth < 0.35 ? 0.1 + Math.random() * 0.15
      : depth < 0.65 ? 0.2 + Math.random() * 0.2
      : 0.3 + Math.random() * 0.3,
    depth,
    speed: 0.01 + depth * 0.03,
    color,
    twinkleSpeed: 0.001 + Math.random() * 0.003,
    twinkleAmplitude: isBright ? 0.2 + Math.random() * 0.2 : 0.05 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    hasGlow: isBright || color !== "white",
  };
}

const COLOR_MAP = {
  white: [239, 244, 255],
  pink: [255, 59, 147],
  cyan: [92, 205, 229],
} as const;

// --- Component ---

export function MineBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 }); // normalized -1..1
  const smoothMouseRef = useRef({ x: 0, y: 0 }); // lerped for smoothness

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

      // Only create stars on first setup
      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: STAR_COUNT }, () =>
          createStar(w, h)
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

      // Smooth mouse lerp (0.05 = slow follow)
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.03;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.03;
      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        // Drift upward slowly
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = h + 5;
          star.x = Math.random() * w;
        }

        // Mouse parallax offset (deeper stars move less)
        const px = star.x + mx * star.depth * PARALLAX_STRENGTH;
        const py = star.y + my * star.depth * PARALLAX_STRENGTH;

        // Twinkle
        const twinkle = Math.sin(t * star.twinkleSpeed + star.phase) * star.twinkleAmplitude;
        const opacity = Math.max(0.02, Math.min(1, star.baseOpacity + twinkle));
        const size = star.baseSize * (1 + twinkle * 0.3);

        const [r, g, b] = COLOR_MAP[star.color];

        // Glow (only on accent/bright stars)
        if (star.hasGlow && size > 0.5) {
          ctx.shadowBlur = size * 6;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.2, size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        // Reset shadow
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

    // Pause when tab hidden
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
      {/* Nebula CSS layers (respond to nothing — static depth) */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 15% 25%, rgba(12, 21, 36, 0.4) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 50% at 80% 70%, rgba(18, 29, 49, 0.35) 0%, transparent 65%)",
            "radial-gradient(ellipse 90% 70% at 50% 85%, rgba(12, 21, 36, 0.25) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Pink glow — subtle pulse */}
      <div
        className="absolute inset-0"
        style={{
          animation: "glowPulse 10s ease-in-out infinite",
          background: [
            "radial-gradient(circle 350px at 22% 35%, rgba(255, 59, 147, 0.1) 0%, transparent 70%)",
            "radial-gradient(circle 280px at 78% 65%, rgba(255, 59, 147, 0.08) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Canvas — stars with parallax + twinkle + glow */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
