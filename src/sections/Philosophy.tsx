'use client';
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Philosophy() {
  const rm = useReducedMotion();
  return (
    <section id="philosophy" className="relative border-t border-white/[0.07] bg-[#060608]">
      <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/35">03 — OBSERVE / PHILOSOPHY</div>
            <h2 className="mt-4 font-display font-[650] tracking-[-0.03em] leading-[0.95] text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontSize: "clamp(28px, 4.2vw, 52px)" }}>
              Touch explores<br /> the boundary between<br /> <span className="text-white/55">interface and material.</span>
            </h2>
            <div className="mt-6 h-[1px] w-full bg-white/10" />
            <div className="mt-6 grid gap-5 font-mono text-[12.5px] leading-[1.9] text-white/55">
              <p>
                Most interfaces treat interaction as a navigation event — a click that triggers a page or a state.
                TOUCH treats it as a <span className="text-white/90">physical input</span>. Velocity, pressure, duration and trajectory become forces.
              </p>
              <p>
                The surface is not a button. It is a membrane. It deforms, remembers, propagates waves, and dissipates energy.
                Every pointer movement is sampled, differentiated, and fed into lightweight physics — springs, friction, attraction, wave propagation.
              </p>
              <p className="text-white/70">
                The goal is not to impress with complexity, but to make the digital feel <em className="not-italic border-b border-white/20 pb-0.5">tangible</em> — precise, responsive, and slightly mysterious.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { n: "01", t: "Material, not navigation", d: "Move slowly → soft deformation. Move fast → turbulence. Press → radial pressure. The response is continuous, not discrete." },
              { n: "02", t: "Energy has memory", d: "Trails, ripples and imprints decay exponentially. What you did a second ago still influences the present frame." },
              { n: "03", t: "Constraint breeds expression", d: "No images, no illustrations. Only grid, grain, particles and light. Complexity emerges from rules, not assets." },
            ].map((c, i) => (
              <motion.div
                key={c.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: rm ? 0 : 0.5, delay: i * 0.06, ease: [0.16,1,0.3,1] }}
                className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-white/35">{c.n}</span>
                  <span className="h-[1px] flex-1 bg-white/10" />
                </div>
                <div className="mt-3 font-display font-[600] tracking-tight text-white">{c.t}</div>
                <div className="mt-2 font-mono text-[11.5px] leading-[1.7] text-white/50">{c.d}</div>
              </motion.div>
            ))}

            <div className="rounded-[14px] border border-white/10 bg-white/[0.015] p-5 font-mono text-[10px] leading-relaxed tracking-wide text-white/30">
              <div className="text-white/50 tracking-[0.14em] mb-2">DESIGN CONSTRAINTS</div>
              dark near-black · precise 1px borders · grain 3% · no stock gradients · no glassmorphism clichés · 60 FPS · respects prefers-reduced-motion
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
