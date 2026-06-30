import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DISMISS_KEY = 'piano-coach-onboarding-dismissed';

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true',
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>How this app works</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          <li>
            <strong className="text-foreground">Your iPad does not play the song.</strong> You play
            your real piano; the mic listens and checks each note.
          </li>
          <li>
            Tap <strong className="text-foreground">Start</strong> — Safari will ask for the
            microphone. Tap Allow.
          </li>
          <li>
            Tap <strong className="text-foreground">Calibrate</strong> first for much better
            detection on your Knabe.
          </li>
        </ul>
        <Button size="sm" className="mt-3" onClick={handleDismiss}>
          Got it
        </Button>
      </AlertDescription>
    </Alert>
  );
}
