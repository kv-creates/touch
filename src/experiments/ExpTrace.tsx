'use client';
import { useRef, useEffect, useCallback, useState } from "react";

interface Seg { x:number; y:number; a:number; w:number; }

export function ExpTrace({ sound }: { sound?: (v:number)=>void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const segs = useRef<Seg[]>([]);
  const drawing = useRef(false);
  const last = useRef<{x:number;y:number}|null>(null);
  const [len, setLen] = useState(0);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio||1,1.8):1;

  const addPoint = useCallback((x:number,y:number)=>{
    const r=contRef.current?.getBoundingClientRect(); if(!r) return;
    const nx=(x-r.left)/r.width, ny=(y-r.top)/r.height;
    const prev=last.current;
    let w=2.2;
    if(prev){
      const dx=(nx-prev.x)*r.width, dy=(ny-prev.y)*r.height;
      const v=Math.hypot(dx,dy);
      w = Math.max(1.1, Math.min(10, 10 - v*0.12));
      sound?.(Math.min(30, v));
    }
    segs.current.push({ x:nx, y:ny, a:1, w });
    last.current={x:nx,y:ny};
    if(segs.current.length>520) segs.current.shift();
    setLen(segs.current.length);
  },[sound]);

  const onDown=(e:React.PointerEvent)=>{
    drawing.current=true; last.current=null; (e.target as HTMLElement).setPointerCapture(e.pointerId); addPoint(e.clientX,e.clientY);
  };
  const onMove=(e:React.PointerEvent)=>{ if(!drawing.current) return; addPoint(e.clientX,e.clientY); };
  const onUp=(e:React.PointerEvent)=>{ drawing.current=false; last.current=null; try{(e.target as HTMLElement).releasePointerCapture(e.pointerId);}catch{}};

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx=canvas.getContext("2d")!; let raf:number|undefined;
    const resize=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    }; resize(); window.addEventListener("resize", resize);
    const loop=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r){ raf=requestAnimationFrame(loop); return;}
      const W=r.width,H=r.height;
      ctx.clearRect(0,0,W,H);
      // paper texture grid
      ctx.strokeStyle="rgba(255,255,255,0.035)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for(let y=0;y<H;y+=28){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // draw segs as polyline with varying opacity/width decay
      if(segs.current.length>1){
        ctx.lineCap="round"; ctx.lineJoin="round";
        for(let i=1;i<segs.current.length;i++){
          const a=segs.current[i-1], b=segs.current[i];
          // decay
          b.a *= 0.995;
          const alpha = Math.min(a.a,b.a)*0.92;
          if(alpha<0.02) continue;
          ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
          ctx.lineWidth= (a.w + b.w)/2 * alpha + 0.6;
          ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke();
        }
        segs.current = segs.current.filter(s=>s.a>0.02);
        if(segs.current.length!==len) setLen(segs.current.length);
      }
      // head glow when drawing
      if(drawing.current && last.current){
        const x=last.current.x*W, y=last.current.y*H;
        const g=ctx.createRadialGradient(x,y,0,x,y,18);
        g.addColorStop(0,"rgba(255,255,255,0.22)"); g.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
      }
      raf=requestAnimationFrame(loop);
    }; raf=requestAnimationFrame(loop);
    return()=>{ window.removeEventListener("resize",resize); if(raf) cancelAnimationFrame(raf); };
  },[dpr, len]);

  return (
    <div ref={contRef} className="relative rounded-[16px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">05 — TRACE</span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/25">Dragging creates a path that decays over time</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/30">{len} segments</span>
          <button onClick={()=>{ segs.current=[]; setLen(0); }} className="font-mono text-[10px] tracking-[0.12em] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">CLEAR</button>
        </div>
      </div>
      <div className="relative h-[300px] cursor-crosshair touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="application" aria-label="Trace surface — drag to draw">
        <canvas ref={ref} className="absolute inset-0 touch-none" />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.14em] text-white/30">DRAG TO DRAW — VELOCITY SETS WIDTH</div>
      </div>
      <div className="px-4 py-2.5 font-mono text-[10px] tracking-wide text-white/30 border-t border-white/[0.06] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> decay 0.995 / frame · velocity → width mapping
      </div>
    </div>
  );
}
