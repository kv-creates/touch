import { useEffect, useRef, useState, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorState extends CursorPosition {
  isVisible: boolean;
  isTouchDevice: boolean;
  isHoveringInteractive: boolean;
  isDragging: boolean;
  scale: number;
  blendMode: string;
}

export function useCursor() {
  const [state, setState] = useState<CursorState>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isVisible: true,
    isTouchDevice: false,
    isHoveringInteractive: false,
    isDragging: false,
    scale: 1,
    blendMode: 'difference'
  });

  const rafRef = useRef<ReturnType<typeof requestAnimationFrame>>(undefined as unknown as ReturnType<typeof requestAnimationFrame>);
  const targetRef = useRef<CursorPosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentRef = useRef<CursorPosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const velocityRef = useRef<CursorPosition>({ x: 0, y: 0 });

  const updatePosition = useCallback((x: number, y: number) => {
    targetRef.current = { x, y };
  }, []);

  const setHoveringInteractive = useCallback((hovering: boolean) => {
    setState(prev => ({
      ...prev,
      isHoveringInteractive: hovering,
      scale: hovering ? 1.5 : 1,
      blendMode: hovering ? 'normal' : 'difference'
    }));
  }, []);

  const setDragging = useCallback((dragging: boolean) => {
    setState(prev => ({
      ...prev,
      isDragging: dragging,
      scale: dragging ? 0.8 : (prev.isHoveringInteractive ? 1.5 : 1)
    }));
  }, []);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setState(prev => ({ ...prev, isTouchDevice: isTouch, isVisible: !isTouch }));

    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      setState(prev => ({ ...prev, isVisible: false }));
    };

    const handleMouseEnter = () => {
      setState(prev => ({ ...prev, isVisible: true }));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [updatePosition]);

  useEffect(() => {
    if (state.isTouchDevice) return;

    const animate = () => {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      currentRef.current.x += dx * 0.15;
      currentRef.current.y += dy * 0.15;

      velocityRef.current.x = dx * 0.15;
      velocityRef.current.y = dy * 0.15;

      setState(prev => ({
        ...prev,
        x: currentRef.current.x,
        y: currentRef.current.y
      }));

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state.isTouchDevice]);

  return {
    ...state,
    setHoveringInteractive,
    setDragging
  };
}

export function useCursorTrail(count: number = 8) {
  const [positions, setPositions] = useState<CursorPosition[]>(
    Array.from({ length: count }, () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
  );

  useEffect(() => {
    let raf: number;
    const trail = positions.map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });

    const animate = () => {
      trail[0].x += (mouseX - trail[0].x) * 0.3;
      trail[0].y += (mouseY - trail[0].y) * 0.3;

      for (let i = 1; i < trail.length; i++) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.4;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.4;
      }

      setPositions([...trail]);
      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  return positions;
}