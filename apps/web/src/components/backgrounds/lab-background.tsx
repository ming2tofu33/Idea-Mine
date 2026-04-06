"use client";

import { useEffect, useRef } from "react";

// --- Types ---

interface Particle {
  x: number;
  y: number;
  baseSize: number;
  baseOpacity: number;
  color: "cyan" | "white";
  driftX: number; // micro-drift per frame
  driftY: number;
  phase: number;
}

const PARTICLE_COUNT = 80;
const PARALLAX_STRENGTH = 10;
const SCAN_DURATION = 480; // ~8 seconds at 60fps

function createParticle(w: number, h: number): Particle {
  const isCyan = Math.random() < 0.85;

  return {
    // More even spacing: grid-ish with jitter
    x: Math.random() * w,
    y: Math.random() * h,
    baseSize: 0.6 + Math.random() * 0.8,
    baseOpacity: 0.15 + Math.random() * 0.15, // 15-30%
    color: isCyan ? "cyan" : "white",
    driftX: (Math.random() - 0.5) * 0.02,
    driftY: (Math.random() - 0.5) * 0.02,
    phase: Math.random() * Math.PI * 2,
  };
}

const COLOR_MAP = {
  cyan: [92, 205, 229], // #5CCDE5
  white: [239, 244, 255],
} as const;

// --- Component ---

export function LabBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });

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

      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
          createParticle(w, h),
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
        (mouseRef.current.x - smoothMouseRef.current.x) * 0.02;
      smoothMouseRef.current.y +=
        (mouseRef.current.y - smoothMouseRef.current.y) * 0.02;
      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // --- Draw particles ---
      for (const p of particlesRef.current) {
        // Micro-drift
        p.x += p.driftX;
        p.y += p.driftY;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Mouse parallax
        const px = p.x + mx * PARALLAX_STRENGTH;
        const py = p.y + my * PARALLAX_STRENGTH;

        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

        // Very subtle brightness pulse
        const pulse = Math.sin(t * 0.002 + p.phase) * 0.03;
        const opacity = Math.max(0.05, Math.min(0.35, p.baseOpacity + pulse));
        const size = p.baseSize;

        const [r, g, b] = COLOR_MAP[p.color];

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      }

      // --- Draw scan line ---
      const scanY = (t % SCAN_DURATION) / SCAN_DURATION * h;
      const scanGrad = ctx.createLinearGradient(0, scanY, w, scanY);
      // Fade edges, bright center
      scanGrad.addColorStop(0, "rgba(92, 205, 229, 0)");
      scanGrad.addColorStop(0.15, "rgba(92, 205, 229, 0.07)");
      scanGrad.addColorStop(0.5, "rgba(92, 205, 229, 0.08)");
      scanGrad.addColorStop(0.85, "rgba(92, 205, 229, 0.07)");
      scanGrad.addColorStop(1, "rgba(92, 205, 229, 0)");

      // Main line
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle glow around scan line
      const glowGrad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
      glowGrad.addColorStop(0, "rgba(92, 205, 229, 0)");
      glowGrad.addColorStop(0.5, "rgba(92, 205, 229, 0.03)");
      glowGrad.addColorStop(1, "rgba(92, 205, 229, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, scanY - 12, w, 24);

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
      {/* Base color — slightly lighter than Mine (#060C18 vs #02050D) */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#060C18" }}
      />

      {/* Grid hint — faint repeating dots for technical feel */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle 1px at center, #2A3C58 0%, transparent 100%)",
          backgroundSize: "48px 48px",
          opacity: 0.04,
        }}
      />

      {/* Canvas — particles + scan line */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Top cyan directional glow — very faint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(92, 205, 229, 0.03) 0%, transparent 35%)",
        }}
      />

      {/* Vignette — lighter than Mine/Vault for open, flat feel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 0%, rgba(6, 12, 24, 0.2) 100%)",
        }}
      />
    </div>
  );
}
