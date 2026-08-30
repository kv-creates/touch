import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "INITIALIZING SURFACE",
  "CALIBRATING INPUT",
  "LOADING PHYSICS",
  "READY",
];

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 520 : step === 1 ? 420 : 380);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDone(true);
        setTimeout(onDone, 520);
      }, 460);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#060608] flex flex-col items-center justify-center"
          aria-hidden={done}
        >
          {/* subtle grain */}
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`
          }} />

          {/* centered mark */}
          <div className="relative flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-[10px] border border-white/10 flex items-center justify-center bg-white/[0.04]">
                <div className="w-[18px] h-[18px] rounded-[6px] bg-white" style={{ boxShadow: "0 0 20px rgba(255,255,255,0.4)" }} />
              </div>
              <span className="font-mono text-[11px] tracking-[0.24em] text-white/70">TOUCH</span>
              <span className="font-mono text-[10px] tracking-widest text-white/30 ml-1">EXP — 01</span>
            </div>

            <div className="w-[280px] sm:w-[360px] h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="h-[14px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="font-mono text-[10px] tracking-[0.18em] text-white/60 text-center"
                >
                  {STEPS[step]} <span className="text-white/25">· {String(step + 1).padStart(2, "0")} / 04</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-[2px] transition-all duration-500 ${i <= step ? "w-6 bg-white" : "w-6 bg-white/15"}`} />
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.14em] text-white/25">
            PRESS · DRAG · HOLD — SURFACE WILL RESPOND
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
