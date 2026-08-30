'use client';
import { useRef, useEffect, useCallback } from "react";

interface Mark { x:number; y:number; a:number; t:number; }

export function ExpMemory({ sound }: { sound?: (i:number)=>void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const marks = useRef<Mark[]>([]);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio||1, 1.6) : 1;

  const add = useCallback((x:number,y:number)=>{
    const r=contRef.current?.getBoundingClientRect(); if(!r) return;
    marks.current.push({ x:(x-r.left)/r.width, y:(y-r.top)/r.height, a:1, t: performance.now() });
    if(marks.current.length>28) marks.current.shift();
    sound?.(0.45);
  },[sound]);

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx=canvas.getContext("2d")!; let raf: number | undefined;
    const resize=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    }; resize(); window.addEventListener("resize", resize);
    const loop=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r){ raf=requestAnimationFrame(loop); return;}
      const W=r.width,H=r.height;
      ctx.clearRect(0,0,W,H);
      // subtle heatmap-like decaying marks
      marks.current.forEach(m=>{
        const age = (performance.now()-m.t)/1000; // sec
        m.a = Math.max(0, 1 - age*0.22); // ~4.5s fade
        if(m.a<=0.01) return;
        const cx=m.x*W, cy=m.y*H;
        const rad = 22 + (1-m.a)*18;
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad*3.2);
        g.addColorStop(0, `rgba(255,255,255,${0.16*m.a})`);
        g.addColorStop(0.35, `rgba(255,255,255,${0.07*m.a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,rad*3.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=`rgba(255,255,255,${0.9*m.a})`; ctx.beginPath(); ctx.arc(cx,cy,1.7,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=`rgba(255,255,255,${0.18*m.a})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.stroke();
      });
      marks.current = marks.current.filter(m=>m.a>0.015);
      // grid ghost
      ctx.strokeStyle="rgba(255,255,255,0.045)"; ctx.lineWidth=1;
      const step=26; for(let x=0;x<W;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); } for(let y=0;y<H;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      raf=requestAnimationFrame(loop);
    }; raf=requestAnimationFrame(loop);
    return()=>{ window.removeEventListener("resize",resize); if(raf) cancelAnimationFrame(raf); };
  },[dpr]);

  return (
    <div ref={contRef} className="relative rounded-[16px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">03 — MEMORY</span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/25">The surface remembers and slowly fades</span>
        </div>
        <span className="font-mono text-[10px] text-white/30">{marks.current.length} imprints</span>
      </div>
      <div className="relative h-[300px] cursor-crosshair touch-none" onPointerDown={(e)=>add(e.clientX,e.clientY)} role="button" tabIndex={0} aria-label="Memory surface — click to leave imprint" onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" "){ const r=contRef.current?.getBoundingClientRect(); if(r) add(r.left+r.width/2, r.top+r.height/2); }}}>
        <canvas ref={ref} className="absolute inset-0" />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.14em] text-white/30">TAP TO IMPRINT — FADES IN ~4.5S</div>
      </div>
      <div className="px-4 py-2.5 font-mono text-[10px] tracking-wide text-white/30 border-t border-white/[0.06] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> exponential decay · half-life ~1.8s · max 28 marks
      </div>
    </div>
  );
}
