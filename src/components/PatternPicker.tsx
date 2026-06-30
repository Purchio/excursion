import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { TimedSong } from '../types/song';
import type { PracticePattern } from '../types/pattern';
import { extractPracticePatterns } from '../utils/patternExtractor';
import { getCompletedPatterns, setPatternCompleted } from '../utils/patternStorage';
import { PatternSparkline } from './PatternSparkline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PatternPickerProps {
  song: TimedSong;
  onClose: () => void;
  onSelect: (pattern: PracticePattern) => void;
}

function PatternCard({
  pattern,
  selected,
  completed,
  onSelect,
  onToggleComplete,
}: {
  pattern: PracticePattern;
  selected: boolean;
  completed: boolean;
  onSelect: () => void;
  onToggleComplete: (done: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/50',
        selected && 'border-primary ring-1 ring-primary',
        completed && 'opacity-75',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{pattern.label}</span>
          {selected && <Badge className="text-[10px]">Practicing</Badge>}
        </div>
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
          aria-label={`Mark ${pattern.label} complete`}
        />
      </div>
      <PatternSparkline points={pattern.sparkline} />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{pattern.measureLabel}</span>
        <span>{pattern.repeatGoal}×</span>
      </div>
    </button>
  );
}

export function PatternPicker({ song, onClose, onSelect }: PatternPickerProps) {
  const { left, right } = useMemo(() => extractPracticePatterns(song), [song]);
  const [completed, setCompleted] = useState(() => getCompletedPatterns(song.id));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleComplete = (patternId: string, done: boolean) => {
    setPatternCompleted(song.id, patternId, done);
    setCompleted(getCompletedPatterns(song.id));
  };

  const empty = left.length === 0 && right.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">{song.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {empty ? (
          <p className="text-center text-muted-foreground">
            Not enough repeating phrases detected for this song yet. Try play-along mode, or a
            simpler built-in song.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400/90">
                Left hand
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {left.map((p) => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    selected={false}
                    completed={completed.has(p.id)}
                    onSelect={() => onSelect(p)}
                    onToggleComplete={(d) => toggleComplete(p.id, d)}
                  />
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400/90">
                Right hand
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {right.map((p) => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    selected={false}
                    completed={completed.has(p.id)}
                    onSelect={() => onSelect(p)}
                    onToggleComplete={(d) => toggleComplete(p.id, d)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <p className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        Tap a pattern to loop it · checkbox to mark done · Esc to close
      </p>
    </div>
  );
}
