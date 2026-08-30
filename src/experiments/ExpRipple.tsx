'use client';
import { useRef, useEffect, useState, useCallback } from "react";

interface Wave { x:number; y:number; r:number; a:number; }

export function ExpRipple({ sound }: { sound?: (i:number)=>void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const waves = useRef<Wave[]>([]);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio||1,2) : 1;
  const [hint, setHint] = useState(true);

  const add = useCallback((x:number,y:number)=>{
    const c = contRef.current?.getBoundingClientRect();
    if(!c) return;
    waves.current.push({ x:(x-c.left)/c.width, y:(y-c.top)/c.height, r:0, a:0.55 });
    if(waves.current.length>10) waves.current.shift();
    sound?.(0.6);
    setHint(false);
  },[sound]);

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext("2d")!; let raf:number | undefined;
    const resize=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    }; resize(); window.addEventListener("resize", resize);
    const loop=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r){ raf=requestAnimationFrame(loop); return;}
      const W=r.width,H=r.height;
      ctx.clearRect(0,0,W,H);
      // base plate
      ctx.fillStyle="rgba(255,255,255,0.02)"; ctx.fillRect(0,0,W,H);
      // waves
      waves.current.forEach(w=>{
        w.r += 2.6; w.a *= 0.982;
        if(w.a>0.015){
          const cx=w.x*W, cy=w.y*H;
          ctx.strokeStyle=`rgba(255,255,255,${w.a})`; ctx.lineWidth=1.1; ctx.beginPath(); ctx.arc(cx,cy,w.r,0,Math.PI*2); ctx.stroke();
          ctx.strokeStyle=`rgba(255,255,255,${w.a*0.4})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,w.r*0.66,0,Math.PI*2); ctx.stroke();
          ctx.fillStyle=`rgba(255,255,255,${w.a*0.08})`; ctx.beginPath(); ctx.arc(cx,cy,w.r*0.16,0,Math.PI*2); ctx.fill();
        }
      });
      waves.current=waves.current.filter(w=>w.a>0.012 && w.r< Math.max(W,H)*0.9);
      raf=requestAnimationFrame(loop);
    }; raf=requestAnimationFrame(loop);
    return()=>{ window.removeEventListener("resize",resize); if(raf) cancelAnimationFrame(raf); };
  },[dpr]);

  return (
    <div ref={contRef} className="relative rounded-[16px] border border-white/10 bg-white/[0.02] overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">01 — RIPPLE</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-wide text-white/25">Click and create physical-looking waves</span>
        </div>
        <span className="font-mono text-[10px] text-white/30">{waves.current.length} active</span>
      </div>
      <div className="relative h-[300px] cursor-crosshair touch-none select-none" onPointerDown={(e)=>add(e.clientX,e.clientY)} role="button" tabIndex={0} aria-label="Ripple surface, click to create waves" onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") { const r=contRef.current?.getBoundingClientRect(); if(r) add(r.left+r.width/2, r.top+r.height/2); }}}>
        <canvas ref={ref} className="absolute inset-0" />
        {hint && <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.16em] text-white/35">TAP / CLICK ANYWHERE</div>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/[0.02]" />
      </div>
      <div className="px-4 py-2.5 flex items-center gap-2 font-mono text-[10px] tracking-wide text-white/30 border-t border-white/[0.06]">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> wave propagation · decay 0.982 · velocity 2.6 px/f
      </div>
    </div>
  );
}
