import { useEffect, useRef } from 'react';
import { useGesture } from '@use-gesture/react';

interface SmoothScrollProps {
  children: React.ReactNode;
  className?: string;
}

export default function SmoothScroll({ children, className = '' }: SmoothScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture(
    {
      onDrag: ({ offset: [dx], first, last }) => {
        if (containerRef.current) {
          if (first) {
            containerRef.current.style.transition = 'none';
          }

          containerRef.current.scrollLeft += dx;

          if (last) {
            containerRef.current.style.transition = 'scroll-left 0.3s ease-out';
          }
        }
      },
      drag: {
        from: () => [containerRef.current?.scrollLeft || 0, 0],
        bounds: () => ({
          left: 0,
          right: containerRef.current?.scrollWidth - containerRef.current?.offsetWidth || 0,
        }),
        enabled: () => containerRef.current?.scrollWidth > containerRef.current?.offsetWidth,
      },
    },
    { eventOptions: { passive: false } }
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'smooth';
      containerRef.current.style.webkitOverflowScrolling = 'touch';
    }
  }, []);

  return (
    <div
      {...bind()}
      ref={containerRef}
      className={`overflow-x-auto -mx-2 px-2 ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
}
