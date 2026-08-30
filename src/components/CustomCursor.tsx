import { useCursor } from "@/hooks/useCursor";
import { usePointer } from "@/hooks/usePointer";

export function CustomCursor() {
  const { x, y, isVisible, isTouchDevice, isHoveringInteractive, isDragging, scale, blendMode } = useCursor();
  const p = usePointer();

  if (isTouchDevice || !isVisible) return null;

  // velocity stretch
  const v = Math.min(24, p.velocity);
  const stretch = 1 + v * 0.015;
  const scaleX = isDragging ? 0.88 : isHoveringInteractive ? 1.42 : 1.05 * (v>12 ? stretch : 1);
  const scaleY = isDragging ? 0.88 : isHoveringInteractive ? 1.42 : 1.05 * (v>12 ? 1/stretch : 1);

  const style: React.CSSProperties = {
    left: 0, top: 0,
    transform: `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${scaleX}, ${scaleY}) scale(${scale})`,
    mixBlendMode: blendMode as any,
  };

  return (
    <div className="pointer-events-none fixed z-[9999] select-none hidden lg:block" style={style} aria-hidden>
      <div className="relative w-[28px] h-[28px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/90" style={{ boxShadow:"0 0 0 1px rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.18)"}} />
        <div className="w-[3.5px] h-[3.5px] rounded-full bg-white" style={{ opacity: isHoveringInteractive ? 0 : 1, transform: isHoveringInteractive ? "scale(0)" : "scale(1)", transition:"all 140ms cubic-bezier(0.34,1.56,0.64,1)"}} />
        {isHoveringInteractive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[14px] h-[1.2px] bg-white/85 absolute" />
            <div className="w-[1.2px] h-[14px] bg-white/85 absolute" />
          </div>
        )}
        {isDragging && <div className="absolute inset-[-6px] rounded-full border border-white/30 border-dashed animate-spin" style={{ animationDuration:"1.2s"}} />}
      </div>
      {/* velocity tail dot */}
      <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] rounded-full bg-white/55 -translate-x-1/2 -translate-y-1/2" style={{ transform:`translate(-50%,-50%) translate(${Math.min(8, v*0.5)}px, 0)`, opacity: v>6?0.55:0, transition:"transform 80ms linear, opacity 120ms" }} />
    </div>
  );
}
