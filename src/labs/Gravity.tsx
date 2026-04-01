import { useEffect, useRef, useCallback } from 'react';

const G = 0.5;
const MIN_DIST = 20;
const MAX_BODIES = 40;
const TRAIL_ALPHA = 0.15;
const DAMPING = 0.999;

const PALETTE = [
  '#06b6d4', // cyan
  '#7c3aed', // violet
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#ec4899', // pink
  '#84cc16', // lime
];

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
}

function randomBody(x: number, y: number, canvasW: number, canvasH: number): Body {
  // Give a tangential velocity relative to canvas center so things orbit naturally
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  // Orbital speed approximation
  const speed = 0.8 + Math.random() * 1.2;
  const mass = 5 + Math.random() * 25;
  return {
    x,
    y,
    vx: (-dy / dist) * speed + (Math.random() - 0.5) * 0.5,
    vy: (dx / dist) * speed + (Math.random() - 0.5) * 0.5,
    mass,
    radius: Math.cbrt(mass) * 2.5,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  };
}

export default function Gravity() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<Body[]>([]);
  const rafRef = useRef<number>(0);

  const addBody = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (bodiesRef.current.length >= MAX_BODIES) bodiesRef.current.shift();
    bodiesRef.current.push(randomBody(x, y, canvas.width, canvas.height));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed a few starting bodies
    const seed = () => {
      const w = canvas.width;
      const h = canvas.height;
      [[w * 0.35, h * 0.4], [w * 0.65, h * 0.6], [w * 0.5, h * 0.3]].forEach(([x, y]) => {
        bodiesRef.current.push(randomBody(x, y, w, h));
      });
    };
    seed();

    const draw = () => {
      const bodies = bodiesRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Trail: semi-transparent fill each frame
      ctx.fillStyle = `rgba(0,0,0,${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, w, h);

      // Update physics
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const safeDist = Math.max(dist, MIN_DIST);
          const force = (G * a.mass * b.mass) / (safeDist * safeDist);
          const nx = dx / dist;
          const ny = dy / dist;
          a.vx += (force / a.mass) * nx;
          a.vy += (force / a.mass) * ny;
          b.vx -= (force / b.mass) * nx;
          b.vy -= (force / b.mass) * ny;
        }
      }

      for (const body of bodies) {
        body.vx *= DAMPING;
        body.vy *= DAMPING;
        body.x += body.vx;
        body.y += body.vy;

        // Bounce off edges
        if (body.x - body.radius < 0) { body.x = body.radius; body.vx *= -0.7; }
        if (body.x + body.radius > w) { body.x = w - body.radius; body.vx *= -0.7; }
        if (body.y - body.radius < 0) { body.y = body.radius; body.vy *= -0.7; }
        if (body.y + body.radius > h) { body.y = h - body.radius; body.vy *= -0.7; }

        // Draw glow
        const grd = ctx.createRadialGradient(body.x, body.y, 0, body.x, body.y, body.radius * 2.5);
        grd.addColorStop(0, body.color + 'cc');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Draw body
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        ctx.fillStyle = body.color;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      bodiesRef.current = [];
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    addBody(e.clientX - rect.left, e.clientY - rect.top);
  }, [addBody]);

  const handleClear = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    bodiesRef.current = [];
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full cursor-crosshair"
      onClick={handleClick}
      onContextMenu={handleClear}
    />
  );
}
