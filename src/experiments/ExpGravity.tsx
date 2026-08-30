'use client';
import { useRef, useEffect } from "react";

interface Obj { x:number; y:number; vx:number; vy:number; r:number; }

export function ExpGravity() {
  const ref = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const objs = useRef<Obj[]>([]);
  const pointer = useRef({ x:0.5, y:0.5, active:false });
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio||1,1.6):1;

  useEffect(()=>{
    objs.current = Array.from({length: 12}, ()=>({
      x: Math.random()*0.8+0.1, y: Math.random()*0.6+0.15,
      vx:(Math.random()-0.5)*0.004, vy:(Math.random()-0.5)*0.004, r: 8+Math.random()*10
    }));
  },[]);

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx=canvas.getContext("2d")!; let raf:number|undefined;
    const resize=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    }; resize(); window.addEventListener("resize", resize);
    const onMove=(e:PointerEvent)=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r) return;
      pointer.current={ x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height, active:true };
    };
    const onLeave=()=> pointer.current.active=false;
    contRef.current?.addEventListener("pointermove", onMove as any);
    contRef.current?.addEventListener("pointerleave", onLeave);

    const loop=()=>{
      const r=contRef.current?.getBoundingClientRect(); if(!r){ raf=requestAnimationFrame(loop); return;}
      const W=r.width,H=r.height;
      ctx.clearRect(0,0,W,H);
      // gravity well
      if(pointer.current.active){
        const px=pointer.current.x*W, py=pointer.current.y*H;
        const g=ctx.createRadialGradient(px,py,0,px,py,180);
        g.addColorStop(0,"rgba(255,255,255,0.10)"); g.addColorStop(0.45,"rgba(255,255,255,0.04)"); g.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,180,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,0.10)"; ctx.setLineDash([3,6]); ctx.beginPath(); ctx.arc(px,py,180,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fill();
        ctx.font="10px JetBrains Mono, monospace"; ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.fillText("G · 0.85", px+10, py-10);
      }
      // physics
      objs.current.forEach(o=>{
        if(pointer.current.active){
          const dx = pointer.current.x - o.x; const dy = pointer.current.y - o.y;
          const d = Math.hypot(dx,dy); // normalized 0..~1.4
          const dPx = d * Math.max(W,H);
          if(dPx>8){
            // inverse square-ish
            const force = 0.00095 / (d*d + 0.015);
            o.vx += (dx/d)*force; o.vy += (dy/d)*force;
          }
        }
        // mutual repulsion mild + friction
        objs.current.forEach(other=>{
          if(other===o) return;
          const dx = other.x - o.x; const dy = other.y - o.y;
          const d = Math.hypot(dx,dy);
          const min = (o.r+other.r)/Math.min(W,H)*1.05;
          if(d<min && d>0.0001){
            const push=(min-d)/d*0.00018;
            o.vx -= (dx/d)*push*60; o.vy -= (dy/d)*push*60;
          }
        });
        o.vx*=0.985; o.vy*=0.985;
        o.x+=o.vx; o.y+=o.vy;
        o.x=Math.max(o.r/W, Math.min(1-o.r/W, o.x));
        o.y=Math.max(o.r/H, Math.min(1-o.r/H, o.y));
        if(o.x<=o.r/W || o.x>=1-o.r/W) o.vx*=-0.6;
        if(o.y<=o.r/H || o.y>=1-o.r/H) o.vy*=-0.6;
      });
      objs.current.forEach(o=>{
        const x=o.x*W, y=o.y*H;
        // shadow
        ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(x+2, y+4, o.r*0.9, o.r*0.55, 0,0,Math.PI*2); ctx.fill();
        // object
        ctx.fillStyle="rgba(255,255,255,0.94)"; ctx.strokeStyle="rgba(255,255,255,0.14)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(x,y,o.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
        // inner highlight
        const grd=ctx.createRadialGradient(x-o.r*0.25,y-o.r*0.35,0,x,y,o.r);
        grd.addColorStop(0,"rgba(255,255,255,0.55)"); grd.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(x,y,o.r,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="rgba(0,0,0,0.72)"; ctx.font="600 10px JetBrains Mono, monospace"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("●", x, y+0.5);
      });
      raf=requestAnimationFrame(loop);
    }; raf=requestAnimationFrame(loop);
    return()=>{ window.removeEventListener("resize", resize); contRef.current?.removeEventListener("pointermove", onMove as any); contRef.current?.removeEventListener("pointerleave", onLeave); if(raf) cancelAnimationFrame(raf); };
  },[dpr]);

  return (
    <div ref={contRef} className="relative rounded-[16px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">04 — GRAVITY</span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/25">Objects react as if pulled by cursor</span>
        </div>
        <span className="font-mono text-[10px] text-white/30">inverse-square · friction 0.985</span>
      </div>
      <div className="relative h-[300px] cursor-none touch-none select-none">
        <canvas ref={ref} className="absolute inset-0" />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.14em] text-white/30">MOVE CURSOR — GRAVITY WELL FOLLOWS</div>
      </div>
      <div className="px-4 py-2.5 font-mono text-[10px] tracking-wide text-white/30 border-t border-white/[0.06] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" /> 12 bodies · wall damping 0.6 · mutual repulsion
      </div>
    </div>
  );
}
