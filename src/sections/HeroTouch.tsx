'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePointer } from "@/hooks/usePointer";

interface Ripple { x: number; y: number; r: number; a: number; max: number; }
interface TrailPt { x: number; y: number; a: number; }

export function HeroTouch({ touchMode, soundImpulse, soundGlide }: { touchMode: boolean; soundImpulse: (i:number)=>void; soundGlide:(v:number)=>void }) {
  const reducedMotion = useReducedMotion();
  const pointer = usePointer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const trailRef = useRef<TrailPt[]>([]);
  const particlesRef = useRef<{x:number;y:number;vx:number;vy:number}[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const lastVelRef = useRef(0);

  const [dpr, setDpr] = useState(1);

  // init particles
  useEffect(() => {
    const count = reducedMotion ? 18 : (window.innerWidth < 768 ? 28 : 48);
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.002, vy: (Math.random()-0.5)*0.002
    }));
  }, [reducedMotion]);

  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, 2));
  }, []);

  const addRipple = useCallback((x: number, y: number, intensity = 1) => {
    if (reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (x - rect.left) / rect.width;
    const ny = (y - rect.top) / rect.height;
    ripplesRef.current.push({ x: nx, y: ny, r: 0, a: 0.22 * intensity, max: 0.22 + intensity*0.35 });
    if (ripplesRef.current.length > 8) ripplesRef.current.shift();
  }, [reducedMotion]);

  // pointer listeners for ripples/trail
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      addRipple(e.clientX, e.clientY, 1.1);
      soundImpulse(0.7);
    };
    const onMove = (e: PointerEvent) => {
      const v = pointer.velocity;
      if (Math.abs(v - lastVelRef.current) > 8 && v > 12) soundGlide(v);
      lastVelRef.current = v;
      if (e.buttons === 1 || pointer.isDown) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        trailRef.current.push({ x: (e.clientX-rect.left)/rect.width, y: (e.clientY-rect.top)/rect.height, a: 1 });
        if (trailRef.current.length > 90) trailRef.current.shift();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
    };
  }, [addRipple, pointer.velocity, pointer.isDown, soundImpulse, soundGlide]);

  // also touch handlers for canvas
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    addRipple(e.clientX, e.clientY, 1.2);
    soundImpulse(0.9);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastT = performance.now();
    const animate = (t: number) => {
      const dt = Math.min((t - lastT)/16.66, 2);
      lastT = t;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) { rafRef.current = requestAnimationFrame(animate); return; }
      const W = rect.width, H = rect.height;

      // fade background
      ctx.clearRect(0,0,W,H);

      // subtle base gradient vignette
      const grad = ctx.createRadialGradient(W*0.5, H*0.45, 0, W*0.5, H*0.45, Math.max(W,H)*0.9);
      grad.addColorStop(0, "rgba(255,255,255,0.06)");
      grad.addColorStop(0.45, "rgba(255,255,255,0.015)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      const cols = 14, rows = 9;
      const cellW = W / cols, cellH = H / rows;
      // warp grid based on pointer
      const px = pointer.x - rect.left;
      const py = pointer.y - rect.top;
      const isInside = px>=0 && px<=W && py>=0 && py<=H;
      for (let i=0;i<=cols;i++) {
        ctx.beginPath();
        for (let y=0;y<=H;y+=4) {
          let x = i*cellW;
          if (isInside && !reducedMotion) {
            const dx = x - px; const dy = y - py;
            const d = Math.sqrt(dx*dx+dy*dy);
            const infl = Math.max(0, 1 - d/220) * (pointer.isDown ? 18 : 9) * (pointer.velocity/14 + 0.6);
            const ang = Math.atan2(dy,dx);
            x += Math.cos(ang) * infl * 0.6;
          }
          if (y===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      for (let j=0;j<=rows;j++) {
        ctx.beginPath();
        for (let x=0;x<=W;x+=4) {
          let y = j*cellH;
          if (isInside && !reducedMotion) {
            const dx = x - px; const dy = y - py;
            const d = Math.sqrt(dx*dx+dy*dy);
            const infl = Math.max(0, 1 - d/220) * (pointer.isDown ? 18 : 9) * (pointer.velocity/14 + 0.6);
            const ang = Math.atan2(dy,dx);
            y += Math.sin(ang) * infl * 0.6;
          }
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }

      // trail with decay
      if (!reducedMotion && trailRef.current.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i=1;i<trailRef.current.length;i++) {
          const a = trailRef.current[i];
          const b = trailRef.current[i-1];
          const alpha = (i / trailRef.current.length) * a.a * 0.45;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 10 * alpha + 1;
          ctx.beginPath();
          ctx.moveTo(b.x*W, b.y*H);
          ctx.lineTo(a.x*W, a.y*H);
          ctx.stroke();
          a.a *= 0.985;
        }
        trailRef.current = trailRef.current.filter(pt => pt.a > 0.02);
      }

      // particles field
      if (!reducedMotion) {
        particlesRef.current.forEach(p => {
          // attraction/repulsion
          if (isInside) {
            const dx = (px / W - p.x);
            const dy = (py / H - p.y);
            const d = Math.sqrt(dx*dx+dy*dy);
            if (d < 0.22 && d>0.0001) {
              const f = (0.22 - d)/0.22 * 0.0009 * (pointer.isDown ? 2.2 : 1);
              p.vx += (dx/d)*f*dt;
              p.vy += (dy/d)*f*dt;
              // turbulence when fast
              if (pointer.velocity > 18) {
                p.vx += (Math.random()-0.5)*0.0012*dt;
                p.vy += (Math.random()-0.5)*0.0012*dt;
              }
            }
          }
          p.vx *= 0.995; p.vy*=0.995;
          p.x += p.vx*dt; p.y += p.vy*dt;
          if (p.x<0) p.x=1; if(p.x>1) p.x=0; if(p.y<0) p.y=1; if(p.y>1) p.y=0;
          const sx = p.x*W, sy = p.y*H;
          ctx.fillStyle = "rgba(255,255,255,0.62)";
          ctx.beginPath(); ctx.arc(sx,sy, 1.1, 0, Math.PI*2); ctx.fill();
          // faint connection to pointer
          if (isInside) {
            const d2 = Math.hypot(sx-px, sy-py);
            if (d2 < 140) {
              ctx.strokeStyle = `rgba(255,255,255,${(1-d2/140)*0.09})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(px,py); ctx.stroke();
            }
          }
        });
      }

      // ripples
      ripplesRef.current.forEach(r => {
        r.r += 2.2 * dt * (0.9 + r.max);
        r.a *= 0.985;
        if (r.a < 0.005) r.a = 0;
        if (r.a > 0) {
          ctx.strokeStyle = `rgba(255,255,255,${r.a})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(r.x*W, r.y*H, r.r, 0, Math.PI*2); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${r.a*0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(r.x*W, r.y*H, r.r*0.62, 0, Math.PI*2); ctx.stroke();
        }
      });
      ripplesRef.current = ripplesRef.current.filter(r=>r.a>0.008 && r.r < Math.max(W,H)*0.7);

      // cursor pressure halo
      if (isInside) {
        const intensity = pointer.isDown ? 1 : Math.min(1, pointer.velocity/30*0.7 + 0.15);
        const rad = pointer.isDown ? 78 : 44 + intensity*28;
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, `rgba(255,255,255,${0.10*intensity})`);
        g.addColorStop(0.45, `rgba(255,255,255,${0.03*intensity})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px,py,rad,0,Math.PI*2); ctx.fill();

        // fine cross
        ctx.strokeStyle = `rgba(255,255,255,${0.18+intensity*0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px-14, py); ctx.lineTo(px-6, py);
        ctx.moveTo(px+6, py); ctx.lineTo(px+14, py);
        ctx.moveTo(px, py-14); ctx.lineTo(px, py-6);
        ctx.moveTo(px, py+6); ctx.lineTo(px, py+14);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath(); ctx.arc(px,py,1.6,0,Math.PI*2); ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dpr, pointer.x, pointer.y, pointer.velocity, pointer.isDown, reducedMotion]);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-[#070708] border-y border-white/[0.07]">
      {/* header rule */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div
        className="relative w-full h-[62vh] sm:h-[68vh] lg:h-[72vh] min-h-[420px] cursor-none select-none"
        onPointerDown={handleCanvasPointerDown}
        role="application"
        aria-label="Interactive tactile surface — move, click, drag"
        tabIndex={0}
        onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") { const r=containerRef.current?.getBoundingClientRect(); if(r) addRipple(r.left+r.width/2, r.top+r.height/2,1); }}}
      >
        <canvas ref={canvasRef} className="absolute inset-0 touch-none" />

        {/* center typography — softly warped */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16,1,0.3,1], delay: 0.15 }}
            className="text-center"
          >
            <div className="font-mono text-[10px] tracking-[0.28em] text-white/40">SURFACE — 01</div>
            <h1 className="mt-3 font-[700] tracking-[-0.04em] leading-[0.88] text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: "clamp(56px, 14vw, 176px)" }}>
              TOUCH
            </h1>
            <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-white/45 max-w-[520px] mx-auto px-6">
              Move · Click · Drag · Hold — the material deforms. Velocity creates turbulence. Pressure leaves a trace.
            </p>
          </motion.div>
        </div>

        {/* edge labels */}
        <div className="pointer-events-none absolute left-3 sm:left-6 top-4 sm:top-6 font-mono text-[10px] tracking-[0.16em] text-white/28 hidden sm:block">
          INTERACTIVE FIELD
        </div>
        <div className="pointer-events-none absolute right-3 sm:right-6 top-4 sm:top-6 font-mono text-[10px] tracking-[0.16em] text-white/28">
          {touchMode ? "TOUCH MODE — ON" : "TOUCH MODE — OFF"}
        </div>
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-white/30">
          <span className="w-1 h-1 rounded-full bg-white/50" />
          DRAG TO DEFORM
          <span className="w-1 h-1 rounded-full bg-white/20" />
          CLICK FOR RIPPLE
        </div>
      </div>

      {/* bottom meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-white/[0.06] bg-white/[0.01] font-mono text-[10px] tracking-[0.14em] text-white/35">
        <span>0.00 — 1.00 PRESSURE · 60 FPS TARGET · POINTER TRACKING</span>
        <span className="hidden sm:inline">SCROLL TO EXPLORE EXPERIMENTS →</span>
      </div>
    </section>
  );
}
