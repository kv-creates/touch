import { useEffect, useState, useRef, useCallback } from 'react';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollProgress(currentScrollY / (document.documentElement.scrollHeight - window.innerHeight));
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollDirection, scrollProgress };
}

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px',
        ...options
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref: elementRef, isIntersecting, entry };
}

export function useTouch() {
  const [isTouching, setIsTouching] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDurationRef = useRef(0);
  const durationIntervalRef = useRef<number>(undefined as unknown as number);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setIsTouching(true);
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    setTouchDelta({ x: 0, y: 0 });
    touchDurationRef.current = 0;

    durationIntervalRef.current = window.setInterval(() => {
      touchDurationRef.current += 16;
    }, 16);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    if (touchStart) {
      setTouchDelta({
        x: touch.clientX - touchStart.x,
        y: touch.clientY - touchStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [touchStart]);

  return {
    isTouching,
    touchStart,
    touchCurrent,
    touchDelta,
    touchDuration: touchDurationRef.current
  };
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    isSupported: boolean;
  }>({
    alpha: null,
    beta: null,
    gamma: null,
    isSupported: false
  });

  useEffect(() => {
    const isSupported = 'DeviceOrientationEvent' in window;
    setOrientation(prev => ({ ...prev, isSupported }));

    if (!isSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        isSupported: true
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return orientation;
}

export function useSpring(initialValue: number, config: { stiffness: number; damping: number; mass: number } = { stiffness: 170, damping: 26, mass: 1 }) {
  const [value, setValue] = useState(initialValue);
  const [velocity, setVelocity] = useState(0);
  const targetRef = useRef(initialValue);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame>>(undefined as unknown as ReturnType<typeof requestAnimationFrame>);

  const setTarget = useCallback((target: number) => {
    targetRef.current = target;
  }, []);

  useEffect(() => {
    const animate = () => {
      const displacement = targetRef.current - value;
      const springForce = displacement * config.stiffness;
      const dampingForce = velocity * config.damping;
      const acceleration = (springForce - dampingForce) / config.mass;
      const newVelocity = velocity + acceleration * 0.016;
      const newValue = value + newVelocity * 0.016;

      setValue(newValue);
      setVelocity(newVelocity);

      if (Math.abs(newVelocity) > 0.01 || Math.abs(displacement) > 0.01) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, velocity, config.stiffness, config.damping, config.mass]);

  return [value, setTarget] as const;
}