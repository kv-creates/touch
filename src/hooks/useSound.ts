import { useRef, useCallback, useState } from "react";

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);
  const mutedRef = useRef(false);

  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    mutedRef.current = !next;
    if (next) ensure();
    if (ctxRef.current && !next) {
      // keep context but mute
    }
  }, [enabled, ensure]);

  const play = useCallback((freq: number, dur = 0.12, vol = 0.06, type: OscillatorType = "sine") => {
    if (mutedRef.current || !enabled) return;
    try {
      const ctx = ensure();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 1200;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(filt).connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now);
      osc.stop(now + dur);
    } catch {}
  }, [enabled, ensure]);

  const impulse = useCallback((intensity = 0.5) => {
    play(80 + intensity * 220, 0.18, 0.04 + intensity * 0.06, "sine");
    // second harmonic
    setTimeout(() => play(160 + intensity * 400, 0.08, 0.02, "triangle"), 20);
  }, [play]);

  const glide = useCallback((vel: number) => {
    const f = 120 + Math.min(vel * 12, 600);
    play(f, 0.06, 0.015, "sine");
  }, [play]);

  return { enabled, toggle, play, impulse, glide };
}
