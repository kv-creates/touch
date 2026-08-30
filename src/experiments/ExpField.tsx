'use client';
import { useRef, useEffect } from "react";

export function ExpField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x:0.5, y:0.5, active:false });
  const parts = useRef<{x:number;y:number;vx:number;vy:number}[]>([]);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio||1, 1.6) : 1;

  useEffect(()=>{
    const isMobile = window.innerWidth < 768;
    const n = isMobile ? 42 : 72;
    parts.current = Array.from({length:n}, ()=>({ x:Math.random(), y:Math.random(), vx:(Math.random()-0.5)*0.003, vy:(Math.random()-0.5)*0.003 }));
  },[]);

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext("2d")!; let raf: number | undefined;
    const resize=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    }; resize(); window.addEventListener("resize", resize);
    const onMove=(e:PointerEvent)=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      pointer.current = { x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height, active: true };
    };
    const onLeave=()=> pointer.current.active=false;
    contRef.current?.addEventListener("pointermove", onMove as any);
    contRef.current?.addEventListener("pointerleave", onLeave);

    const loop=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r){ raf=requestAnimationFrame(loop); return;}
      const W=r.width,H=r.height;
      ctx.clearRect(0,0,W,H);
      // field influence
      parts.current.forEach(p=>{
        if(pointer.current.active){
          const dx = pointer.current.x - p.x; const dy = pointer.current.y - p.y;
          const d = Math.hypot(dx,dy);
          if(d<0.22 && d>0.0001){
            const f = (0.22-d)/0.22 * 0.0022;
            p.vx += (dx/d)*f; p.vy += (dy/d)*f;
          }
        }
        // gentle curl noise like
        p.vx += Math.sin(p.y*6.2 + performance.now()*0.00024)*0.00007;
        p.vy += Math.cos(p.x*6.2 + performance.now()*0.00024)*0.00007;
        p.vx *= 0.985; p.vy*=0.985;
        p.x += p.vx; p.y += p.vy;
        if(p.x<0) p.x=1; if(p.x>1) p.x=0; if(p.y<0) p.y=1; if(p.y>1) p.y=0;
      });
      // draw connections
      for(let i=0;i<parts.current.length;i++){
        const a=parts.current[i];
        const ax=a.x*W, ay=a.y*H;
        ctx.fillStyle="rgba(255,255,255,0.82)"; ctx.beginPath(); ctx.arc(ax,ay,1.35,0,Math.PI*2); ctx.fill();
        for(let j=i+1;j<parts.current.length;j++){
          const b=parts.current[j]; const d=Math.hypot((a.x-b.x)*W,(a.y-b.y)*H);
          if(d< 90){ ctx.strokeStyle=`rgba(255,255,255,${(1-d/90)*0.10})`; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(b.x*W,b.y*H); ctx.stroke(); }
        }
        if(pointer.current.active){
          const px=pointer.current.x*W, py=pointer.current.y*H;
          const d2=Math.hypot(ax-px, ay-py);
          if(d2<140){ ctx.strokeStyle=`rgba(255,255,255,${(1-d2/140)*0.16})`; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(px,py); ctx.stroke();}
        }
      }
      if(pointer.current.active){
        const px=pointer.current.x*W, py=pointer.current.y*H;
        const g=ctx.createRadialGradient(px,py,0,px,py,120);
        g.addColorStop(0,"rgba(255,255,255,0.08)"); g.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,120,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,0.14)"; ctx.setLineDash([4,6]); ctx.beginPath(); ctx.arc(px,py,120,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      }
      raf=requestAnimationFrame(loop);
    }; raf=requestAnimationFrame(loop);
    return()=>{ window.removeEventListener("resize",resize); contRef.current?.removeEventListener("pointermove", onMove as any); contRef.current?.removeEventListener("pointerleave", onLeave); if(raf) cancelAnimationFrame(raf); };
  },[dpr]);

  return (
    <div ref={contRef} className="relative rounded-[16px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">02 — FIELD</span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/25">Move the cursor and manipulate a particle field</span>
        </div>
        <span className="font-mono text-[10px] text-white/30">attraction · inverse falloff</span>
      </div>
      <div className="relative h-[300px] cursor-none touch-none">
        <canvas ref={ref} className="absolute inset-0" />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.14em] text-white/30">MOVE TO DISTORT</div>
      </div>
      <div className="px-4 py-2.5 font-mono text-[10px] tracking-wide text-white/30 border-t border-white/[0.06] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> particle attraction within 22% · velocity damping 0.985
      </div>
    </div>
  );
}
