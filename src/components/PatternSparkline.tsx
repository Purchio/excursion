interface PatternSparklineProps {
  points: number[];
  className?: string;
}

export function PatternSparkline({ points, className }: PatternSparklineProps) {
  if (points.length < 2) {
    return <div className={`h-10 rounded bg-muted/40 ${className ?? ''}`} />;
  }

  const w = 100;
  const h = 40;
  const step = w / (points.length - 1);
  const d = points
    .map((y, i) => {
      const x = i * step;
      const py = h - y * (h - 8) - 4;
      return `${i === 0 ? 'M' : 'L'}${x},${py}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-10 w-full text-primary ${className ?? ''}`} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {points.map((y, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - y * (h - 8) - 4}
          r="2.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
