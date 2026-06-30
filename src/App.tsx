import { useState } from 'react';
import { Piano, CheckCircle2 } from 'lucide-react';
import { CalibrationProvider, useCalibration } from './context/CalibrationContext';
import { getAllBuiltinSongs, loadMidiSong } from './data/songLibrary';
import { CalibrationWizard } from './components/calibration/CalibrationWizard';
import { OnboardingBanner } from './components/OnboardingBanner';
import { SongPicker } from './components/SongPicker';
import { UnifiedPractice } from './components/UnifiedPractice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TimedSong } from './types/song';

type AppView = 'home' | 'practice' | 'calibrate';

function AppContent() {
  const [view, setView] = useState<AppView>('home');
  const [selectedSong, setSelectedSong] = useState<TimedSong | null>(null);
  const [loadingMidiId, setLoadingMidiId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { hasAudioCalibration, hasVisualCalibration } = useCalibration();

  const handleMidiSelect = async (catalogId: string) => {
    setLoadingMidiId(catalogId);
    setLoadError(null);
    try {
      const song = await loadMidiSong(catalogId);
      setSelectedSong(song);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load MIDI');
    } finally {
      setLoadingMidiId(null);
    }
  };

  if (view === 'calibrate') {
    return <CalibrationWizard onClose={() => setView('home')} />;
  }

  return (
    <div className="app mx-auto max-w-xl px-4 pb-6">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Piano className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Super Piano Coach</h1>
            <p className="text-sm text-muted-foreground">Fingers · hand plan · mic verify</p>
          </div>
        </div>
        <Button
          variant={hasAudioCalibration ? 'secondary' : 'default'}
          size="sm"
          onClick={() => setView('calibrate')}
        >
          {hasAudioCalibration ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Calibrated
            </>
          ) : (
            'Calibrate'
          )}
        </Button>
      </header>

      <main className="pt-4">
        {selectedSong ? (
          <UnifiedPractice song={selectedSong} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            <OnboardingBanner />
            <section className="mb-6 space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Learn on your real piano — see where both hands go, hear the reference audio,
                and let your iPhone mic verify each key.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Hand planning</Badge>
                <Badge variant="secondary">MIDI playback</Badge>
                <Badge variant="secondary">Mic verify</Badge>
                <Badge variant="secondary">MIDI import</Badge>
              </div>
              {!hasAudioCalibration && (
                <Alert>
                  <AlertDescription>
                    <strong className="text-foreground">Tip:</strong> Calibrate your piano first for
                    much better note detection on your Knabe.
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setView('calibrate')}
                    >
                      Calibrate now
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {hasAudioCalibration && (
                <p className="text-sm text-emerald-400">
                  {hasVisualCalibration
                    ? '✓ Audio & camera calibrated for your piano'
                    : '✓ Audio calibrated — add camera map for key overlays'}
                </p>
              )}
            </section>
            {loadError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            )}
            <SongPicker
              songs={getAllBuiltinSongs()}
              onSelect={setSelectedSong}
              onSelectMidi={handleMidiSelect}
              onUpload={setSelectedSong}
              loadingMidiId={loadingMidiId}
            />
          </>
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <CalibrationProvider>
      <AppContent />
    </CalibrationProvider>
  );
}
