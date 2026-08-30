'use client';
import { REPO_URL, SITE_URL } from "@/config";

export function Source() {
  return (
    <section id="source" className="relative border-t border-white/[0.07] bg-[#060608]">
      <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/35">05 — SOURCE</div>
            <h2 className="mt-3 font-display font-[650] tracking-[-0.03em] text-white" style={{ fontFamily:"Space Grotesk, system-ui, sans-serif", fontSize:"clamp(26px, 3.6vw, 42px)" }}>Open source. Fork it.</h2>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/45 max-w-[560px]">Production-quality, minimal dependencies, deployable to GitHub Pages. One config constant controls the repository URL.</p>
          </div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white text-[#060608] px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] font-[600] hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
            VIEW REPOSITORY ↗
          </a>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-[14px] border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.16em] text-white/40">REPOSITORY</span>
              <span className="font-mono text-[10px] text-white/30">MIT · React + Vite</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-[10px] border border-white/10 bg-black/30 p-3 font-mono text-[11px] text-white/70 break-all">
                <span className="text-white/35">config.ts → </span> REPO_URL = "{REPO_URL}"
              </div>
              <div className="grid sm:grid-cols-2 gap-3 font-mono text-[11px] leading-relaxed">
                <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-white/60 tracking-[0.12em] text-[10px]">STACK</div>
                  <div className="mt-1.5 text-white/75">React 19 · Vite 6 · TypeScript 6<br/>Framer Motion (layout only)<br/>Canvas 2D · Web Audio API</div>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-white/60 tracking-[0.12em] text-[10px]">STRUCTURE</div>
                  <div className="mt-1.5 text-white/65">src/components · sections<br/>experiments · hooks · utils<br/>vite.config.ts base: "/touch/"</div>
                </div>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-[#0c0c0e] p-3 overflow-x-auto">
                <div className="font-mono text-[10px] tracking-[0.14em] text-white/30 mb-2">INSTALL & RUN</div>
                <pre className="font-mono text-[11px] leading-[1.7] text-white/75">{`npm install
npm run dev      # localhost:3000
npm run build    # → dist/
npm run preview`}</pre>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
              <div className="font-mono text-[10px] tracking-[0.16em] text-white/40">EXPERIMENTS</div>
              <ol className="mt-3 space-y-2 font-mono text-[11px] text-white/60">
                <li><span className="text-white/90">01 RIPPLE</span> — radial pressure wave, propagation 2.6 px/f</li>
                <li><span className="text-white/90">02 FIELD</span> — attraction field, inverse falloff 220 px</li>
                <li><span className="text-white/90">03 MEMORY</span> — imprints fading in ~4.5 s, half-life 1.8 s</li>
                <li><span className="text-white/90">04 GRAVITY</span> — inverse-square well, friction 0.985</li>
                <li><span className="text-white/90">05 TRACE</span> — velocity → width, decay 0.995</li>
              </ol>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
              <div className="font-mono text-[10px] tracking-[0.16em] text-white/40">DEPLOYMENT</div>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">GitHub Actions — <span className="text-white/75">.github/workflows/deploy.yml</span> installs, builds, and publishes <span className="text-white/75">dist</span> to Pages. Vite <span className="text-white/75">base "/touch/"</span> ensures asset paths are correct. Works with custom domains — change <span className="text-white/75">SITE_URL</span> in config.ts.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`${REPO_URL}/actions`} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">Actions</a>
                <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">Live Site</a>
                <span className="font-mono text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-white/40">LICENSE — MIT</span>
              </div>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/[0.015] p-4 font-mono text-[10px] leading-relaxed tracking-wide text-white/30">
              No fabricated stats. No analytics. If you fork, keep the grain — it’s 3% opacity, but it makes the surface feel real.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.14em] text-white/30">
          <span>© {new Date().getFullYear()} TOUCH — An Experimental Interface · Built for curious hands</span>
          <a href="#" onClick={(e)=>{ e.preventDefault(); window.scrollTo({ top:0, behavior:"smooth"}); }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-white/60 hover:text-white transition-colors">BACK TO SURFACE ↑</a>
        </div>
      </div>
    </section>
  );
}
