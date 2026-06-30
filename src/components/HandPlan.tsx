import { midiToNote, fingerLabel } from '../utils/noteUtils';
import type { HandMoment } from '../utils/handPlan';
import { handLabel } from '../utils/handPlan';
import type { TimedNote } from '../types/song';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HandPlanProps {
  now: HandMoment | null;
  upcoming: HandMoment[];
}

function HandSlot({ hand, note }: { hand: 'right' | 'left'; note?: TimedNote }) {
  const isRight = hand === 'right';
  return (
    <Card
      className={cn(
        'flex-1 border',
        isRight ? 'border-blue-500/25 bg-blue-500/5' : 'border-red-500/25 bg-red-500/5',
        !note && 'opacity-50',
      )}
    >
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {handLabel(hand)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {note ? (
          <>
            <p className="text-2xl font-bold tracking-tight">{midiToNote(note.midi)}</p>
            {note.finger && (
              <p className="mt-1 text-sm text-muted-foreground">
                Finger <span className="font-semibold text-foreground">{note.finger}</span>
                <span className="ml-1">({fingerLabel(note.finger)})</span>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Rest</p>
        )}
      </CardContent>
    </Card>
  );
}

export function HandPlan({ now, upcoming }: HandPlanProps) {
  const next = upcoming.filter((m) => !now || m.timeMs > now.timeMs).slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Play now
        </p>
        <div className="flex gap-3">
          <HandSlot hand="right" note={now?.right} />
          <HandSlot hand="left" note={now?.left} />
        </div>
      </div>

      {next.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Coming up — plan your hands
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {next.map((moment, i) => (
              <div key={moment.timeMs} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">→</span>}
                <Badge variant="secondary" className="font-normal">
                  {moment.right && (
                    <span className="text-blue-300">{midiToNote(moment.right.midi)}</span>
                  )}
                  {moment.right && moment.left && <span className="mx-1 text-muted-foreground">+</span>}
                  {moment.left && (
                    <span className="text-red-300">{midiToNote(moment.left.midi)}</span>
                  )}
                  {!moment.right && !moment.left && 'Rest'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
