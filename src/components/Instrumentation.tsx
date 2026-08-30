import { usePointer } from "@/hooks/usePointer";

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-white transition-all duration-100" style={{ width: `${pct * 100}%`, opacity: 0.9 }} />
    </div>
  );
}

export function Instrumentation({ active }: { active: boolean }) {
  const p = usePointer();
  // derive metrics
  const pressure = p.isDown ? Math.min(1, 0.4 + p.velocity * 0.03 + p.pressure * 0.5) : p.pressure * 0.3;
  const energy = Math.min(1, (p.velocity / 40) + (p.isDown ? 0.2 : 0));
  const vx = Math.abs(p.speed);
  const pos = `${Math.round(p.nx * 100)} · ${Math.round(p.ny * 100)}`;

  if (!active) return null;

  return (
    <div className="pointer-events-none select-none fixed left-4 sm:left-6 bottom-4 sm:bottom-6 z-40 flex gap-2 sm:gap-3">
      <div className="hidden sm:flex gap-3">
        {[
          { k: "PRESSURE", v: pressure, txt: pressure.toFixed(2) },
          { k: "VELOCITY", v: Math.min(1, vx / 28), txt: `${vx.toFixed(1)} px/f` },
          { k: "POSITION", v: (p.nx + p.ny) / 2, txt: pos },
          { k: "ENERGY", v: energy, txt: energy.toFixed(2) },
        ].map((m) => (
          <div key={m.k} className="min-w-[120px] rounded-[10px] border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5">
            <div className="font-mono text-[9px] tracking-[0.18em] text-white/40">{m.k}</div>
            <div className="font-mono text-[11px] tracking-wide text-white/90 mt-1">{m.txt}</div>
            <div className="mt-2"><Bar value={m.v} /></div>
          </div>
        ))}
      </div>
      {/* mobile compact */}
      <div className="sm:hidden rounded-[10px] border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2 flex items-center gap-3">
        <span className="font-mono text-[9px] tracking-[0.16em] text-white/40">TOUCH MODE</span>
        <span className="w-[1px] h-3 bg-white/10" />
        <span className="font-mono text-[11px] text-white/80">{Math.round(pressure * 100)}% · {Math.round(Math.min(100, vx * 3))}</span>
      </div>
      <div className="rounded-full border border-white/10 bg-white text-black px-3 py-2 font-mono text-[10px] tracking-[0.16em] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE
      </div>
    </div>
  );
}
