'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { label: "TOUCH", href: "#top" },
  { label: "EXPERIMENTS", href: "#experiments" },
  { label: "SYSTEM", href: "#system" },
  { label: "SOURCE", href: "#source" },
];

export function Navigation({ touchMode, onToggleTouch, soundOn, onToggleSound }: { touchMode:boolean; onToggleTouch:()=>void; soundOn:boolean; onToggleSound:()=>void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=> {
    const h=()=> setScrolled(window.scrollY>12);
    window.addEventListener("scroll", h, { passive:true });
    return()=> window.removeEventListener("scroll", h);
  },[]);

  const go=(href:string)=>{
    const el=document.querySelector(href);
    if(el) el.scrollIntoView({ behavior: "smooth", block:"start" });
    setOpen(false);
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-[200] border-b transition-colors ${scrolled ? "bg-[#060608]/85 backdrop-blur-xl border-white/10" : "bg-transparent border-transparent"}`} aria-label="Primary">
      <div className="max-w-[1160px] mx-auto px-6 sm:px-8 h-[56px] flex items-center justify-between gap-4">
        <a href="#top" onClick={(e)=>{e.preventDefault(); go("#top");}} className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[8px]">
          <span className="w-[28px] h-[28px] rounded-[8px] border border-white/10 bg-white/[0.06] flex items-center justify-center">
            <span className="w-[14px] h-[14px] rounded-[5px] bg-white" style={{ boxShadow:"0 0 12px rgba(255,255,255,0.35)"}} />
          </span>
          <span className="font-mono text-[12px] tracking-[0.22em] font-[600] text-white">TOUCH</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.14em] text-white/35 -ml-1">— EXP 01</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(l=> (
            <button key={l.href} onClick={()=>go(l.href)} className="px-3 py-1.5 rounded-full font-mono text-[11px] tracking-[0.14em] text-white/55 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTouch}
            aria-pressed={touchMode}
            aria-label="Toggle touch mode"
            className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${touchMode ? "bg-white text-black border-white" : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08] hover:text-white"}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${touchMode ? "bg-emerald-500" : "bg-white/40"}`} />
            TOUCH MODE
          </button>

          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Disable sound" : "Enable sound"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${soundOn ? "bg-white text-black border-white" : "bg-white/[0.04] text-white/60 border-white/10 hover:text-white hover:bg-white/[0.06]"}`}
            title={soundOn ? "Sound ON" : "Sound OFF (click to enable)"}
          >
            <span aria-hidden>{soundOn ? "◉" : "◎"}</span> {soundOn ? "SOUND" : "MUTED"}
          </button>

          <button aria-expanded={open} aria-controls="mob" aria-label={open ? "Close menu" : "Open menu"} onClick={()=>setOpen(v=>!v)} className="md:hidden w-[36px] h-[36px] rounded-[10px] border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            <span className="font-mono text-[11px]">{open ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div id="mob" initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.24, ease:[0.16,1,0.3,1] }} className="md:hidden overflow-hidden border-t border-white/10 bg-[#060608]">
            <div className="px-6 py-4 flex flex-col gap-2">
              {LINKS.map(l=> (
                <button key={l.href} onClick={()=>go(l.href)} className="text-left font-mono text-[13px] tracking-[0.14em] text-white/75 hover:text-white py-2.5">{l.label}</button>
              ))}
              <button onClick={()=>{ onToggleTouch(); setOpen(false); }} className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[11px] tracking-[0.14em] ${touchMode ? "bg-white text-black border-white" : "bg-white/[0.04] text-white border-white/10"}`}>TOUCH MODE — {touchMode ? "ON" : "OFF"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
