import { useState } from 'react';
import { CalibrationProvider, useCalibration } from './context/CalibrationContext';
import { getAllBuiltinSongs, loadMidiSong } from './data/songLibrary';
import { CalibrationWizard } from './components/calibration/CalibrationWizard';
import { OnboardingBanner } from './components/OnboardingBanner';
import { SongPicker } from './components/SongPicker';
import { UnifiedPractice } from './components/UnifiedPractice';
import type { TimedSong } from './types/song';
import './styles/app.css';

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
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🎹</span>
          <div>
            <h1>Super Piano Coach</h1>
            <p>Falling notes · fingers · mic verify</p>
          </div>
        </div>
        <button
          type="button"
          className={`btn-calibrate ${hasAudioCalibration ? 'calibrated' : ''}`}
          onClick={() => setView('calibrate')}
        >
          {hasAudioCalibration ? '✓ Calibrated' : 'Calibrate piano'}
        </button>
      </header>

      <main>
        {selectedSong ? (
          <UnifiedPractice song={selectedSong} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            <OnboardingBanner />
            <section className="hero">
              <p>
                Learn on your real piano — falling notes show what to play, synthesized audio
                plays along, and your iPhone mic verifies each key.
              </p>
              <ul className="feature-list">
                <li>🎵 Falling notes with left/right lanes and finger numbers</li>
                <li>🔊 MIDI playback (synthesized piano)</li>
                <li>🎤 Microphone hears which key you press</li>
                <li>📂 Load MIDI files — Satisfaction bundled, import more anytime</li>
                <li>📷 Camera overlay maps keys on your Knabe</li>
              </ul>
              {!hasAudioCalibration && (
                <div className="cal-banner">
                  <p>
                    <strong>Tip:</strong> Calibrate your piano first for much better note
                    detection on your specific instrument.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setView('calibrate')}
                  >
                    Calibrate now
                  </button>
                </div>
              )}
              {hasAudioCalibration && (
                <p className="cal-status-line">
                  {hasVisualCalibration
                    ? '✓ Audio & camera calibrated for your piano'
                    : '✓ Audio calibrated — add camera map for key overlays'}
                </p>
              )}
            </section>
            {loadError && <p className="error-text">{loadError}</p>}
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
