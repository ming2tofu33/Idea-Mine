"use client";

import { useEffect, useRef } from "react";

// --- Types ---

interface Star {
  x: number;
  y: number;
  z: number; // 0 (far) ~ 1 (near), drives everything
  baseSize: number;
  baseOpacity: number;
  color: "white" | "pink" | "cyan";
  twinkleSpeed: number;
  twinkleAmplitude: number;
  phase: number;
  hasGlow: boolean;
  hasCross: boolean; // bright stars get cross/diamond rays
}

const STAR_COUNT = 500;
const PARALLAX_STRENGTH = 35;
const DRIFT_SPEED = 0.00012; // z-axis drift: stars slowly come toward you

function createStar(w: number, h: number, forceZ?: number): Star {
  const rand = Math.random();
  const color: Star["color"] =
    rand < 0.07 ? "pink" : rand < 0.12 ? "cyan" : "white";

  // 70% far, 20% mid, 10% near — 밤하늘은 대부분 먼 별
  const zRand = Math.random();
  const z = forceZ ?? (zRand < 0.7 ? Math.random() * 0.3
    : zRand < 0.9 ? 0.3 + Math.random() * 0.3
    : 0.6 + Math.random() * 0.4);
  const isBright = Math.random() < 0.1;

  return {
    // Distribute across full viewport with extra margin
    x: w * 0.5 + (Math.random() - 0.5) * w * 2.0,
    y: h * 0.5 + (Math.random() - 0.5) * h * 2.0,
    z,
    baseSize: 0.8 + z * 2.0, // far=small but visible, near=large
    baseOpacity: 0.25 + z * 0.45, // far=clearly visible, near=bright
    color,
    twinkleSpeed: 0.0008 + Math.random() * 0.003,
    twinkleAmplitude: isBright ? 0.25 + Math.random() * 0.2 : 0.04 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
    hasGlow: isBright || color !== "white",
    hasCross: isBright && z > 0.6,
  };
}

const COLOR_MAP = {
  white: [239, 244, 255],
  pink: [255, 59, 147],
  cyan: [92, 205, 229],
} as const;

// --- Draw helpers ---

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

// --- Component ---

export function MineBackground() {
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
      const cx = w / 2;
      const cy = h / 2;
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
        nebulaRef.current.style.transform = `translate(${mx * -8}px, ${my * -8}px)`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        // Z-axis drift: near stars rush past, far stars barely crawl
        star.z += DRIFT_SPEED * (0.2 + star.z * star.z * 3);

        if (star.z > 1.1) {
          // Reset to far background
          Object.assign(star, createStar(w, h, 0.01 + Math.random() * 0.1));
        }

        // Perspective projection: near stars spread dramatically from center
        const scale = 0.2 + star.z * star.z * 1.2;
        const projX = cx + (star.x - cx) * scale;
        const projY = cy + (star.y - cy) * scale;

        // Mouse parallax (deeper = less movement)
        const px = projX + mx * star.z * PARALLAX_STRENGTH;
        const py = projY + my * star.z * PARALLAX_STRENGTH;

        // Skip if off screen
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        // Twinkle
        const twinkle =
          Math.sin(t * star.twinkleSpeed + star.phase) * star.twinkleAmplitude;
        const opacity = Math.max(
          0.02,
          Math.min(1, star.baseOpacity * star.z + twinkle),
        );
        const size = Math.max(0.2, star.baseSize * star.z * (1 + twinkle * 0.3));

        const [r, g, b] = COLOR_MAP[star.color];

        // Cross rays for bright near stars
        if (star.hasCross && size > 1.2) {
          drawCross(ctx, px, py, size, r, g, b, opacity);
        }

        // Glow halo
        if (star.hasGlow && size > 0.6) {
          ctx.shadowBlur = size * 8;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`;
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
      {/* Nebula layers — respond to mouse at slower rate */}
      <div
        ref={nebulaRef}
        className="absolute -inset-8 transition-transform duration-700 ease-out"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 18% 25%, rgba(12, 21, 36, 0.5) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 50% at 82% 72%, rgba(18, 29, 49, 0.4) 0%, transparent 65%)",
            "radial-gradient(ellipse 100% 70% at 50% 90%, rgba(12, 21, 36, 0.3) 0%, transparent 55%)",
            "radial-gradient(ellipse 40% 35% at 65% 20%, rgba(18, 29, 49, 0.2) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Pink glow — subtle pulse */}
      <div
        className="absolute inset-0"
        style={{
          animation: "glowPulse 12s ease-in-out infinite",
          background: [
            "radial-gradient(circle 400px at 22% 35%, rgba(255, 59, 147, 0.08) 0%, transparent 70%)",
            "radial-gradient(circle 300px at 78% 68%, rgba(255, 59, 147, 0.06) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Canvas — stars with perspective + parallax + twinkle + glow + cross */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Vignette — darker edges for "observatory viewport" feel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 0%, rgba(2, 5, 13, 0.35) 100%)",
        }}
      />

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
