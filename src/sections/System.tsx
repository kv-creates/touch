'use client';
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const PIPELINE = [
  { k: "INPUT", d: "PointerEvents · TouchEvents · DeviceOrientation", c: "sample @ 60 Hz · normalize to viewport · capture pressure" },
  { k: "MOTION", d: "velocity · acceleration · direction", c: "Δ position / Δ time · exponential smoothing 0.85" },
  { k: "PHYSICS", d: "forces · constraints · decay", c: "spring F=kx · friction 0.97–0.99 · inverse-square attraction" },
  { k: "RENDER", d: "Canvas 2D · rAF · DPR aware", c: "clear → grid warp → particles → waves → halo · GPU transforms" },
  { k: "RESPONSE", d: "light · deformation · sound", c: "radial gradient · crosshair · WebAudio sine 80–600 Hz" },
];

export function System() {
  const rm = useReducedMotion();
  return (
    <section id="system" className="relative border-t border-white/[0.07] bg-[#08080a]">
      <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/35">04 — SYSTEM</div>
            <h2 className="mt-3 font-display font-[650] tracking-[-0.03em] text-white" style={{ fontFamily:"Space Grotesk, system-ui, sans-serif", fontSize:"clamp(26px, 3.6vw, 44px)" }}>How it works</h2>
            <p className="mt-3 font-mono text-[11px] leading-relaxed tracking-wide text-white/45 max-w-[560px]">No heavy engine. Just math, rAF, and careful layering. The pipeline mirrors a research instrument — readable, deterministic, fast.</p>
          </div>
          <div className="font-mono text-[10px] tracking-[0.16em] text-white/30 border border-white/10 rounded-full px-3 py-1.5 bg-white/[0.03]">TARGET 60 FPS · &lt; 120 KB JS · MOBILE AWARE</div>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PIPELINE.map((p, i) => (
            <motion.div
              key={p.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: rm ? 0 : 0.45, delay: i * 0.05, ease: [0.16,1,0.3,1] }}
              className="relative rounded-[14px] border border-white/10 bg-white/[0.03] p-4 flex flex-col min-h-[186px]"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center font-mono text-[10px] text-white/60">{String(i+1).padStart(2,"0")}</span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-white">{p.k}</span>
              </div>
              <div className="mt-3 font-mono text-[11px] leading-snug text-white/75">{p.d}</div>
              <div className="mt-2 font-mono text-[10px] leading-relaxed text-white/35">{p.c}</div>
              {i < PIPELINE.length - 1 && <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/10" />}
              <div className="mt-auto pt-4 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-white/25">
                <span className="w-1 h-1 rounded-full bg-white/40" /> → {PIPELINE[i+1]?.k || "END"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* code-like visual */}
        <div className="mt-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="rounded-[14px] border border-white/10 bg-[#0c0c0e] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <span className="font-mono text-[10px] tracking-[0.16em] text-white/35">CORE LOOP — pointer → force → render</span>
              <span className="font-mono text-[10px] text-white/25">TS · rAF</span>
            </div>
            <pre className="p-4 sm:p-5 font-mono text-[11px] leading-[1.7] text-white/75 overflow-x-auto">
{`// velocity & pressure → force
const dx = x - last.x, dy = y - last.y;
const v  = hypot(dx,dy) / dt;          // px / frame
const pressure = isDown ? 0.7+v*0.03 : 0.2;

// spring — ripple radius
ripple.r += 2.2 * dt;
ripple.a *= 0.985;                       // exponential decay

// particle attraction (inverse falloff)
if (d < 0.22) {
  const f = (0.22-d)/0.22 * 0.0022;
  p.vx += (dx/d)*f; p.vy += (dy/d)*f;
}
p.vx *= 0.985; p.x += p.vx;` }
            </pre>
          </div>

          <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
            <div className="font-mono text-[10px] tracking-[0.16em] text-white/35">PERFORMANCE NOTES</div>
            <ul className="mt-3 space-y-2.5 font-mono text-[11px] leading-relaxed text-white/55">
              <li>• device-aware counts — 28–72 particles, 1.0–1.8 DPR</li>
              <li>• single canvas per section, no React re-renders in loop</li>
              <li>• `will-change: transform` only, GPU layers minimal</li>
              <li>• touch: larger hit areas, coarser sampling</li>
              <li>• `prefers-reduced-motion` → static grid, no particles</li>
              <li>• `pointer*` + `touch*` unified, passive listeners</li>
            </ul>
            <div className="mt-5 rounded-[10px] border border-white/10 bg-black/30 p-3 font-mono text-[10px] tracking-wide text-white/40">
              Fallback: if WebGL unavailable → Canvas2D only (this build uses Canvas2D throughout — no WebGL required).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
