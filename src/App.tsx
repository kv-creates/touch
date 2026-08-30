'use client';
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { CustomCursor } from "@/components/CustomCursor";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Instrumentation } from "@/components/Instrumentation";
import { HeroTouch } from "@/sections/HeroTouch";
import { Philosophy } from "@/sections/Philosophy";
import { System } from "@/sections/System";
import { Source } from "@/sections/Source";
import { ExpRipple } from "@/experiments/ExpRipple";
import { ExpField } from "@/experiments/ExpField";
import { ExpMemory } from "@/experiments/ExpMemory";
import { ExpGravity } from "@/experiments/ExpGravity";
import { ExpTrace } from "@/experiments/ExpTrace";
import { useSound } from "@/hooks/useSound";
import "@/styles/globals.css";

export default function App() {
  const [ready, setReady] = useState(false);
  const [touchMode, setTouchMode] = useState(true);
  const { enabled: soundOn, toggle: toggleSound, impulse, glide } = useSound();

  // ensure body bg
  useEffect(() => {
    document.documentElement.style.background = "#060608";
    document.body.style.background = "#060608";
  }, []);

  return (
    <>
      {!ready && <LoadingScreen onDone={() => setReady(true)} />}

      <a href="#main" className="skip-link">Skip to main content</a>

      <Navigation touchMode={touchMode} onToggleTouch={() => setTouchMode(v => !v)} soundOn={soundOn} onToggleSound={toggleSound} />
      <CustomCursor />

      <main id="main" className="pt-[56px] bg-[#060608] text-white selection:bg-white selection:text-black" aria-hidden={!ready}>
        {/* OPEN — hero */}
        <div id="top">
          <HeroTouch touchMode={touchMode} soundImpulse={impulse} soundGlide={glide} />
        </div>

        {/* TOUCH — mode explainer */}
        <section id="touch" className="relative border-t border-white/[0.07] bg-[#060608]">
          <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-white/35">02 — TOUCH MODE</div>
                <h2 className="mt-3 font-display font-[650] tracking-[-0.03em] text-white" style={{ fontFamily:"Space Grotesk, system-ui, sans-serif", fontSize:"clamp(22px, 3vw, 34px)" }}>
                  {touchMode ? "The surface is listening." : "Touch mode is off."}
                </h2>
                <p className="mt-2.5 font-mono text-[11px] leading-relaxed text-white/45 max-w-[640px]">
                  Turn it on and the instrumentation appears — <span className="text-white/80">pressure, velocity, position, energy</span> update live.
                  Move slowly for soft deformation. Move fast for turbulence. Hold to build pressure. Drag to leave a trace.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTouchMode(v => !v)}
                  aria-pressed={touchMode}
                  className={`rounded-full border px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] font-[600] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${touchMode ? "bg-white text-black border-white" : "bg-white/[0.06] text-white border-white/10 hover:bg-white/[0.09]"}`}
                >
                  {touchMode ? "DISABLE" : "ENABLE"} TOUCH MODE
                </button>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { k: "PRESSURE", v: "0.00 — 1.00", d: "hold duration + pointer pressure · spring stiffness 180" },
                { k: "VELOCITY", v: "px / frame", d: "Δ position / Δ time · drives turbulence & width" },
                { k: "POSITION", v: "nx · ny", d: "normalized viewport · used for attraction fields" },
                { k: "ENERGY", v: "0.00 — 1.00", d: "combination of speed + pressure · modulates glow" },
              ].map(m => (
                <div key={m.k} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-white/35">{m.k}</div>
                  <div className="mt-1.5 font-mono text-[11px] tracking-wide text-white/85">{m.v}</div>
                  <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-white/40">{m.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIMENTS */}
        <section id="experiments" className="relative border-t border-white/[0.07] bg-[#08080a]">
          <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-10 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-white/35">EXPERIMENTS — 05</div>
                <h2 className="mt-3 font-display font-[650] tracking-[-0.03em] text-white" style={{ fontFamily:"Space Grotesk, system-ui, sans-serif", fontSize:"clamp(26px, 3.6vw, 42px)" }}>Try the surface</h2>
                <p className="mt-2.5 font-mono text-[11px] leading-relaxed text-white/45 max-w-[560px]">Each one isolates a single behavior. No page reload. Works with mouse, touch, and pen. Switch by scrolling.</p>
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-white/30 border border-white/10 rounded-full px-3 py-1.5 bg-white/[0.03]">ALL CANVAS · NO WEBGL REQUIRED · 60 FPS</div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-4 sm:gap-5">
              <ExpRipple sound={impulse} />
              <ExpField />
              <ExpMemory sound={impulse} />
              <ExpGravity />
              <div className="lg:col-span-2">
                <ExpTrace sound={glide} />
              </div>
            </div>

            <div className="mt-6 rounded-[12px] border border-white/10 bg-white/[0.02] px-4 py-3 flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-wide text-white/30">
              <span>PointerEvents + TouchEvents + rAF + Canvas2D</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Reduced motion → static fallback · Mobile → coarser sampling</span>
            </div>
          </div>
        </section>

        <Philosophy />
        <System />
        <Source />
      </main>

      <Instrumentation active={touchMode && ready} />

      {/* version badge */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 hidden sm:flex rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-white/55">
        TOUCH v1.0.0 — EXPERIMENTAL
      </div>

      <style>{`
        @media (max-width: 1024px) { * { cursor: auto !important; } }
      `}</style>
    </>
  );
}
