import { useEffect, useRef, useState, useCallback } from "react";

export interface PointerState {
  x: number;
  y: number;
  nx: number; // normalized 0..1
  ny: number;
  pressure: number; // 0..1
  velocity: number;
  speed: number; // pixels per frame
  isDown: boolean;
  isTouch: boolean;
}

export function usePointer() {
  const [state, setState] = useState<PointerState>({
    x: 0, y: 0, nx: 0, ny: 0,
    pressure: 0, velocity: 0, speed: 0,
    isDown: false, isTouch: false,
  });

  const last = useRef({ x: 0, y: 0, t: performance.now() });
  const vel = useRef(0);

  const update = useCallback((x: number, y: number, pressure: number, isDown: boolean, isTouch: boolean) => {
    const now = performance.now();
    const dt = Math.max(now - last.current.t, 16);
    const dx = x - last.current.x;
    const dy = y - last.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = dist / (dt / 16);
    // velocity smoothed
    vel.current = vel.current * 0.85 + speed * 0.15;
    const nx = typeof window !== "undefined" ? x / window.innerWidth : 0;
    const ny = typeof window !== "undefined" ? y / window.innerHeight : 0;
    last.current = { x, y, t: now };
    setState({ x, y, nx, ny, pressure, velocity: vel.current, speed, isDown, isTouch });
  }, []);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let down = false;

    const onMove = (e: PointerEvent) => {
      update(e.clientX, e.clientY, e.pressure !== 0 ? e.pressure : down ? 0.7 : 0.2, down, isTouch);
    };
    const onDown = (e: PointerEvent) => {
      down = true;
      update(e.clientX, e.clientY, e.pressure || 0.8, true, isTouch);
    };
    const onUp = (e: PointerEvent) => {
      down = false;
      update(e.clientX, e.clientY, 0, false, isTouch);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) update(t.clientX, t.clientY, 0.7, true, true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // initial
    update(window.innerWidth / 2, window.innerHeight / 2, 0, false, isTouch);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [update]);

  return state;
}
